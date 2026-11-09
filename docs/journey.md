# Project Istanbul: The Journey (Taksim → Ataköy)

> **Status:** v0.1 · 2026-11-08 · Owner: Onder · Decision: **D-027** (owner-directed, Adopted)
> **Data source:** `prototype/js/journey.js` owns the hood list, order, km, rosters, skins and boss types.
> This doc owns the design intent. If the two disagree, fix the data file.
> **Related:** [level-001-istiklal.md](level-001-istiklal.md) (Level 1 stays hand-built) ·
> [narrative.md](narrative.md) (Chapter 1 arcs) · [story-presentation.md](story-presentation.md) (beats, comics) ·
> [weapons-skills.md](weapons-skills.md) (unlocks, arsenal) · [content-catalog.md](content-catalog.md) (numbers)

---

## 1. The idea in one paragraph

Arda walks home. Chapter 1 is **one walk, 17 km, from Taksim to Ataköy**. It is split into
**20 neighbourhoods (hoods)**. Each hood has **5 levels**, so Chapter 1 is still 100 levels.
Each hood has its own street, props, light, zombie roster and one new twist. Each hood ends
with a **boss at stage 5**, a comic page and a step on the map. Walking the street is the
progress bar. The player should feel distance, not a number.

Old model (flat): one scene, levels 1–100 in the same place. New model (D-027): 20 scenes,
5 levels each, each scene a different neighbourhood.

---

## 2. The walk at a glance

`km` is the cumulative distance when the hood is cleared (from `journey.js`). `Walk` is the km
covered inside the hood. Each stage adds about one fifth of that. Map coordinates for workstream C
are in `journey.js` (`map: [x, y]`).

| # | ID | Hood | District | km | Walk | Levels | Theme | Boss type | Stage-5 boss (canonical name) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `istiklal` | İstiklal | Beyoğlu | 1.0 | 1.0 | L1–5 | istiklal | brute | The Vatman (tram driver) |
| 2 | `galata` | Galata | Beyoğlu | 1.8 | 0.8 | L6–10 | galata | brute | Tour Guide (Turist Rehberi) |
| 3 | `karakoy` | Karaköy | Beyoğlu | 2.6 | 0.8 | L11–15 | karakoy | brute | The Bride (Gelin) |
| 4 | `bridge` | Galata Köprüsü | Haliç | 3.3 | 0.7 | L16–20 | bridge | bloater | Big Fisherman (Koca Balıkçı) |
| 5 | `eminonu` | Eminönü | Fatih | 4.1 | 0.8 | L21–25 | eminonu | brute | The Captain (Kaptan) |
| 6 | `sirkeci` | Sirkeci | Fatih | 4.8 | 0.7 | L26–30 | sirkeci | brute | The Ticket Man (Biletçi) |
| 7 | `kapalicarsi` | Kapalıçarşı | Fatih | 5.6 | 0.8 | L31–35 | bazaar | brute | The Carpet Golem (Halı Golem) |
| 8 | `beyazit` | Beyazıt | Fatih | 6.3 | 0.7 | L36–40 | beyazit | spitter | The Pigeon Man (Güvercinci) |
| 9 | `kumkapi` | Kumkapı | Fatih | 7.0 | 0.7 | L41–45 | kumkapi | bloater | The Fish Porter (Balık Hamalı) |
| 10 | `laleli` | Laleli | Fatih | 7.8 | 0.8 | L46–50 | laleli | brute | The Wholesaler (Toptancı) |
| 11 | `aksaray` | Aksaray | Fatih | 8.6 | 0.8 | L51–55 | aksaray | brute | The Dolmuş Driver (Dolmuşçu) |
| 12 | `yenikapi` | Yenikapı | Fatih | 9.5 | 0.9 | L56–60 | yenikapi | brute | The Evening Crowd (Akşam Kalabalığı) |
| 13 | `samatya` | Samatya | Fatih | 10.3 | 0.8 | L61–65 | samatya | spitter | The Grill Man (Mangal Baba) |
| 14 | `yedikule` | Yedikule | Fatih | 11.1 | 0.8 | L66–70 | yedikule | brute | The Key Keeper (Anahtarcı) |
| 15 | `kazlicesme` | Kazlıçeşme | Zeytinburnu | 12.0 | 0.9 | L71–75 | kazlicesme | spitter | The Hose Man (Hortumcu) |
| 16 | `zeytinburnu` | Zeytinburnu | Zeytinburnu | 13.0 | 1.0 | L76–80 | zeytinburnu | bloater | The Dye Foreman (Boyacı Ustası) |
| 17 | `bakirkoy` | Bakırköy Çarşı | Bakırköy | 14.0 | 1.0 | L81–85 | bakirkoy | brute | The Principal (Müdür) |
| 18 | `bakirkoysahil` | Bakırköy Sahil | Bakırköy | 15.0 | 1.0 | L86–90 | sahil | bloater | The Ice-Cream Man (Dondurmacı) |
| 19 | `atakoysahil` | Ataköy Marina | Bakırköy | 16.2 | 1.2 | L91–95 | marina | brute | The Yacht Owner (Yat Sahibi) |
| 20 | `atakoy` | Ataköy | Bakırköy | 17.0 | 0.8 | L96–100 | atakoy | brute | Sayın Abim (kapıcı; story name Ahmet Abi, D-039) |

**Boss count:** 20 stage-5 bosses. Boss types are only three (brute, bloater, spitter), so each
boss gets its own signature attack on top of the type kit (section 5).

**Geography (v0.8, lane L):** the map check moved two hoods. Kumkapı now comes straight after
Beyazıt (it was after Aksaray), which saves about 0.4 km on the walk and fixes the map, where it sat
out of line. Zeytinburnu and Kazlıçeşme are swapped: Kazlıçeşme is the eastern stop, reached first
from Yedikule. The walk is still stylised, not a GPS route. Ataköy Marina stays before home for the
story (Dad's Letter). The owner confirms the order before the art pass (open item 9.4). `km` and
map coordinates in `journey.js` follow the new order. The H## labels (sections, tables, story ids) use the walk position
and were re-keyed with the order change: story ids (`H##i#`, `H##p#`, `H##b`), bark pools (`BK.hdNN.S`), hood looks and
enemy roster adds move with their hood. `tools/check-hood-keys.js` checks that each hood keeps its own content.

---

## 3. Level structure template

Levels 2–100 come from one generator (E2). Level 1 (`H01-L1`, "İlk Lokma") stays hand-built. It is the
tutorial in `level-001-istiklal.md`. The template applies from `H01-L2`.

### 3.1 Stages

Each hood has five levels, one stage each (stage N = level N of the hood, so `H07-L3` is stage 3). Stage 5 (level 5) is always the boss. Route stages end with a hold zone (the last
12 m before the exit gate).

| Stage | Role | Layout | Length (m) | Duration target | Hold | Waves (rule) | Elite windows | Modifier |
|---|---|---|---|---|---|---|---|---|
| 1 | Arrival | Route | 170 | 3:00 | 40 s | walker + runner; roster[2] scripted intro at the first 25% | none | dusk |
| 2 | Open ground | Arena or route | 200 | 3:30 | 50 s | adds roster[2] (40%) | 1 at 45% of the stage | none |
| 3 | Set piece | Route, ambush on | 230 | 4:00 | 60 s | adds roster[3] when the hood has one | 1 at 60% | night (on about half the hoods) |
| 4 | Twist | Route, hood twist | 260 | 4:30 | 70 s | full roster | 2 (at 35% and 70%) | fog or horde (one per hood) |
| 5 | Boss | 100 m approach + boss arena | 160 | 5:00–6:00 | none (arena) | boss + adds (roster[0–1]) every 6 s on intro, then 60% of stage rate | boss mini-elite adds | per hood |

Route stages use the exit gate and the hold timer. Arena stages use the timer. Stage 5 uses the
boss arena. Source numbers: `config-levels.js` (`C.levels.stages`, E2, in progress).

### 3.2 Spawns

| Stage | Spawn rate (per s, E2 `rate`) | Typical total spawns | Peak alive target | Notes |
|---|---|---|---|---|
| 1 | 1.2 | ~45 | 25 | Teaches the hood's first type |
| 2 | 1.5 | ~80 | 45 | Crawlers and diners as the hood needs |
| 3 | 2.0 | ~120 | 80 | Ambush from behind, one elite |
| 4 | 1.8 (holds 1.6 → 2.6 → 3.4) | ~170 | 110 | Two elites, hold phases ramp |
| 5 | 1.1 (adds) + boss | ~90 | 90 | Adds stop at boss death |

Global cap is 300 alive (GD §6). E2's cap is 140 for generated levels. Keep both until the bot has run on
all 100 levels. Telemetry `perf_sample` reports the actual peak.

### 3.3 Rules that apply to every level

- One new enemy type per stage at most.
- One elite window per stage at most, except stage 4 (two).
- Each route stage has one twist object or prop from the hood list (section 5).
- A stage 1 after a boss is a breather. Use 80% of the spawn rate.
- A level is a full run. In-run level resets to 1 every level (GD §3). Power carries over only through meta.

---

## 4. Objectives (variety across 100 levels)

Every stage must use a different objective from the one before it. Twelve objective types cover
the list.

| ID | Objective | Used on | How it plays |
|---|---|---|---|
| O1 | Reach the exit | Route stages | Walk to the gate. Hold timer runs in the last 12 m. |
| O2 | Survive the timer | Route stages: a tram, ferry, train, minibus or boat wait | Timer 45–90 s by vehicle. Kills do not shorten it. Done when it runs out with Arda alive. |
| O3 | Hold the shutter | Route hold | Stand in the hold zone until the shutter opens. |
| O4 | Cut the lines | Bridge, tram, port | Break fishing lines or overhead wires to open the path. |
| O5 | Light the way | Dark hoods | Turn on lamps or carry a torch. Light radius matters. |
| O6 | Escort | Set pieces | A civilian walks with Arda. Grabs stop them. |
| O7 | Defend the cart | Street carts | A cart has HP. Zombies go for it. Losing it drops a reward. |
| O8 | Find the keys | Yedikule, Ataköy | Keys open gates. |
| O9 | Ring the bell | School bell (Bakırköy Çarşı) | Stand by the school-bell booster while the upload runs (`defend.bell`). A ring that repels the horde is proposed, not built. |
| O10 | Pop the drums | Zeytinburnu | Gas drums explode in chains. Position matters. |
| O11 | Shut the gates | Sirkeci, Kapalıçarşı | Close turnstiles or shutters before the horde arrives. |
| O12 | Clear the stairs | Galata, Yenikapı, Ataköy | Kill counts per flight of stairs. Stairs are chokepoints in the scene; they are not an objective kind.

**v0.8 assignment (lane L).** Stages 1–4 of each hood use the objective in `assign` (`config-objectives.js`). The per-hood table is in `hoods-bible.md` §5.3. Ids are `kind` or `kind.variant`: `survive` (tram, ferry, marmaray = train, dolmus = minibus, boat), `collect` (crate, cut = lines or tram wires, lamp, key, charcoal), `defend` (booster, cart, bell), `hack` (street, signal, gate), `reach` (home). Rules: a tram wait only where a tram runs; a ferry wait at a pier; a train wait at a station; a boat wait at a quay or marina; a minibus wait at a dolmuş stop. No kind repeats in a row inside a hood.

---

## 5. Hood by hood

### 5.0 v0.6 enemy schedule (D-042)

New types join the route mix from the stage shown (`C.levels.schedule` in `config-levels.js`). Their share grows with hood index (`newGrow` 0.1). Affixes roll on regular generated-level spawns (`C.affix.schedule`) from the hood shown. Hoods H01 to H04 have no new types and no affixes, so the early funnel is unchanged.

| Hood | Name | New type (from stage) |
|---|---|---|
| H05 | Eminönü | parkur (3) |
| H07 | Kapalıçarşı | kasap (3) |
| H08 | Beyazıt | parkur (4) |
| H09 | Kumkapı | kasap (4) |
| H11 | Aksaray | zehirli (3) |
| H13 | Samatya | kasap (3) |
| H14 | Yedikule | zehirli (4) |
| H15 | Kazlıçeşme | parkur (3) |
| H16 | Zeytinburnu | zehirli (2) |
| H17 | Bakırköy Çarşı | kasap (4) |
| H18 | Bakırköy Sahil | parkur (2) |
| H19 | Ataköy Marina | kasap (2) |
| H20 | Ataköy | parkur (2), zehirli (3), kasap (4) |

Affixes: **hizli** (fast, +35% speed, 10% of walker, runner and parkur spawns) from H11; **zirhli** (armoured, takes 30% less damage, 12% of walker, runner and crawler spawns) from H12; **patlayan** (bursts on death, 10% of walker, runner and crawler spawns) from H16. Each has a badge and a mark over the figure (`art-enemies3.js`).

Stats (config-levels.js): kasap 150 HP, armour 0.75, cleaver swing 18 damage in a 2.0 radius after a 0.9 s wind-up ring. Parkur 16 HP, speed 2.6, leaps 2.6 to 7.0 m after a 0.45 s ring, 12 damage. Zehirli 18 HP, spit glob leaves a 6 s toxic pool (4 DPS).

---


Each hood lists: **Scene** (landmark treatment, props, palette, ground, water, light), **Roster and
twist**, **Stage 3 and 4**, **Boss** and **Story beat**. Landmarks follow the guardrails in
[narrative.md](narrative.md) (landmarks shown with respect, generic silhouettes, no real brand names).
Shop names are fictional. No national flags, no religious building as a target, no real transit
livery.

### H01 · İstiklal (Beyoğlu, km 1.0, L1–5)

- **Scene:** pastel Beyoğlu facades with striped awnings and hanging shop signs (LOKANTA, SAHAF,
  KURUYEMİŞ, BERBER, ECZANE). Red tram body in a generic red with no logo, on tram rails.
  Sidewalk band with curbs (D-026). Overhead string lights.
- **Props:** tulip tea glasses, shoe-shine box, corn cart with umbrella, simit cart, café chairs, seagulls.
- **Palette:** peach, mint and faded blue facades. Tram red. Warm gold lamp light.
- **Ground:** stone slabs and rails. **Water:** none (gulls only).
- **Light:** evening, then dusk. Streetlights fail one by one in stage 3.
- **Roster:** walker, runner, crawler, diner. Skins: waiter, tourist, shopper, student.
- **Twist:** diners turn (a human becomes a zombie after 2.5 s). Manhole crawlers under the rails.
- **Stage 3:** Kestaneci's chestnut cart charges down the lane. Defend the cart (O7). Drops the
  Chestnut Brazier idea (future weapon, section 12 of weapons-skills.md).
- **Stage 4:** overhead tram wires. Cut the wires (O4) to drop a Live Cable pickup.
- **Boss:** The Vatman. Brute in a derailed red tram. Tram Rush across the rail lane (1.2 s
  telegraph, kills zombies in its path). Bell Shockwave. Passenger Spill. Phase 2 on foot with the
  brake lever. (Content-catalog L10 kit, moved here.)
- **Story beat:** the dinner ends in a bite. Arda heads downhill. The tram crashes and Arda walks on.

### H02 · Galata (Beyoğlu, km 1.8, L6–10)

- **Scene:** steep stone stairs and cobbles. Tower silhouette in the distance, shown with respect.
  Wooden balconies, cast-iron lamp posts, flower pots on stairs, cats on steps.
- **Props:** meyhane tables with rakı bottles (no brands), tavla boards, busker's guitar case, tea houses.
- **Palette:** terracotta roofs, blue shutters, amber lantern light, deep blue night.
- **Ground:** stone stairs (chokepoints). **Water:** none. The Golden Horn shows in the distance.
- **Light:** evening, lanterns. No neon.
- **Roster:** walker, runner, crawler, spitter. Skins: tourist, musician, student, shopper.
- **Twist:** spitter acid lobs leave puddles on the stairs (slow, no slip). Stairs are chokepoints (O12).
- **Stage 3:** the tour group's flag bearers. Kill the bearers before the group's buff spreads.
- **Stage 4:** a horde comes down the stairs at once (horde modifier).
- **Boss:** Tour Guide. Brute with a flag. The flag gives tourists within 4 m +20% speed. Megaphone
  cone blast. Summons tourist groups every 15 s. Kill priority: the flag.
- **Story beat:** a musician plays his last note on a dead street. The tour guide keeps talking.

### H03 · Karaköy (Beyoğlu, km 2.6, L11–15)

- **Scene:** waterfront pier with bollards, cream and coral café fronts, pastry trays in windows,
  paper lanterns and wedding ribbons on the café terraces.
- **Props:** café chairs, espresso counters (no brand), tulip glasses, ferry ticket booth (no brand).
- **Palette:** cream, coral, teal sea, paper-lantern gold.
- **Ground:** setts and pier boards. **Water:** pier edge and Golden Horn mouth.
- **Light:** evening into dusk, warm lamps.
- **Roster:** walker, runner, spitter, bloater. Skins: barista, fisher, worker, tourist.
- **Twist:** bloaters meet café gas tanks. A bloater burst can chain into the tanks.
- **Stage 3:** the wedding convoy comes down the street with horns. Fireworks unlock here (L16 in the
  current config, see section 7; the convoy is the story reason).
- **Stage 4:** a cat (Paşa) hisses at an empty alley. It is not empty. Paşa's Hiss (passive, future).
- **Boss:** The Bride. Bouquet throw marks one zombie as an elite (kill it in 2 s). Veil Spin.
  Below 50%: a halay dance line of 10 zombies sweeps the arena. Kill the leader to break the line.
- **Story beat:** the wedding café. Paşa adopts Arda (L12). From the pier, Arda sees the bridge.

### H04 · Galata Köprüsü (Haliç, km 3.3, L16–20)

- **Scene:** two-deck iron bridge. Upper deck with lamps and rail. Lower deck with a fish-restaurant
  row, lanterns and bench tables. Balık-ekmek boats below.
- **Props:** fishing rods along the rail, line tangles, bait buckets, gulls, lamp posts, lanterns.
- **Palette:** steel grey, green-black water, amber lanterns, white fog.
- **Ground:** iron deck and steel grating. **Water:** Golden Horn on both sides.
- **Light:** dusk into night, fog rolling off the Horn (no flashing fog).
- **Roster:** walker, runner, bloater, spitter. Skins: fisher, commuter, vendor.
- **Twist:** fishing lines strung across the deck. A line grabs and pulls the player 1.5 m (wiggle to
  cut it, -50% pull). Two decks with stairs between.
- **Stage 3:** Kaan's misunderstanding. A non-lethal composure fight on the deck. Kaan thinks Arda is
  infected (content-catalog L30 fight, moved here).
- **Stage 4:** the Horn fog thickens. Horde from both ends of the bridge.
- **Boss:** Big Fisherman. Bloater. Casts three lines at once. Net Throw roots for 1.2 s. Bait
  buckets burst into toxic chains. Calls adds every 20 s. Kaan joins after the boss (proposed L20,
  see section 9.1).
- **Story beat:** Kaan and Arda team up on the bridge. Eminönü is ahead.

### H05 · Eminönü (Fatih, km 4.1, L21–25)

- **Scene:** ferry quay with a gangway, a row of balık-ekmek boats, spice sacks in pyramids. Domes in
  the skyline, not named, not targeted.
- **Props:** spice pyramids (sumac, pepper, saffron), simit and corn carts, tea samovar, ferry
  gangway, fishing crates.
- **Palette:** saffron, pepper red, sumac purple, quay navy.
- **Ground:** wet quay planks and setts. **Water:** Golden Horn mouth and the ferry quay.
- **Light:** night, lamps and boat lights.
- **Roster:** walker, runner, crawler, brute, spitter. Skins: vendor, hamal, commuter, shopper.
- **Twist:** pepper clouds stun (sneezes, 0.5 s). The pier tilts every 6 s. Zombies slide toward the
  water edge. Pushing them in kills them. No animal is harmed.
- **Stage 3:** the pepper market. Spice clouds drift through the aisles.
- **Stage 4:** the tilted pier. Sledgehammer ring slams are good here.
- **Boss:** The Captain. Zombified balık-ekmek boat captain. Anchor chain sweep. Grill slam leaves a
  flame pool. Horn call summons runners. **Kaan's beat:** Kaan has to put down his own captain.
  Kaan is a companion in this fight.
- **Story beat:** the first emotional beat. Kaan's grill and ice crates. Kaan's captain is gone.

### H06 · Sirkeci (Fatih, km 4.8, L26–30)

- **Scene:** old terminal hall with a tall railway clock and iron girders. Platform edge. Golden Horn
  shore beyond the glass. Generic names on the departure board.
- **Props:** turnstiles, luggage carts, wooden benches, ticket booths, brass rails.
- **Palette:** cold white fluorescent, dark brown wood, brass.
- **Ground:** terrazzo floor and concrete platform. **Water:** Golden Horn shore.
- **Light:** night with fluorescent flicker (under 3 Hz).
- **Roster:** walker, runner, brute, bloater. Skins: commuter, conductor, tourist.
- **Twist:** turnstile gates. A closed gate blocks zombies. Pickups open gates. Magnet unlocks here.
- **Stage 3:** the platform gate race (O11).
- **Stage 4:** the ticket queue. The horde comes from the waiting line.
- **Boss:** The Ticket Man. Brute. "No ticket, no entry." Summons gate blocks (walls that fall) and a
  line of zombie commuters.
- **Story beat:** the vertical-slice build milestone ends here (L30). Chapter 1 continues to L100 (D-040). Mom's last clear call before the signal fails. The
  railway clock stops.

### H07 · Kapalıçarşı (Fatih, km 5.6, L31–35)

- **Scene:** covered bazaar lanes under vaults. Hanging kilims. Brass lanterns. Shutters with painted numbers.
- **Props:** lokum trays, tea stalls with samovars, nazar bead stalls, gold trays in windows (generic),
  coffee-house signs, carpet rolls.
- **Palette:** ochre, carpet reds, brass gold, lantern amber.
- **Ground:** worn stone flags. **Water:** none.
- **Light:** warm lanterns only. Shadows are deep.
- **Roster:** walker, runner, crawler, spitter, brute. Skins: shopkeeper, hamal, tourist.
- **Twist:** shutters drop and split the arena (O11). Carpet rolls are cover. Maze lanes.
- **Stage 3:** the lane maze. Shutters close behind Arda.
- **Stage 4:** shop counters become chokepoints. A shutter with a handwritten note: "Kapıyı açmayın"
  (do not open the door).
- **Boss:** The Carpet Golem. Brute armoured in rolled carpets. Carpet-roll charge (line telegraph).
  The weak point is the unrolled core. Drops the Kilim (future weapon).
- **Story beat:** the first human threat hinted: looters. Story only, no human enemies yet.

### H08 · Beyazıt (Fatih, km 6.3, L36–40)

- **Scene:** a square with an old university gate, bookstalls (sahaf) with crates, and student
  coffee houses. Pigeons on the square. No religious building in the scene as a target.
- **Props:** book crates, bookstall lanterns, student bikes, tavla tables, pigeon feed bags.
- **Palette:** paper cream, ink blue, pigeon grey, warm book-lamp light.
- **Ground:** square paving and stone steps. **Water:** a stylised fountain, no sea.
- **Light:** night, warm book-lamps.
- **Roster:** walker, runner, spitter, bloater. Skins: student, vendor, pigeonman.
- **Twist:** pigeon flocks take off before a spawn. The flock is the early warning. Pigeons scatter
  and are never harmed.
- **Stage 3:** the flock walk. Pigeons block the lane when they land.
- **Stage 4:** bookstall fires. Open the street terminals (hack.street).
- **Boss:** The Pigeon Man. Spitter. Feeds a flock that covers the screen (flock cover lasts 4 s).
  Acid spit pools. Lure the flock away from the spit line.
- **Story beat:** the Pigeon Man feeds the birds every morning. The sign on the door says "Bugün kapalı"
  (closed today).

### H09 · Kumkapı (Fatih, km 7.0, L41–45)

- **Scene:** a fish-restaurant lane with red and gold lanterns. Fishing rods on the quay. Moored boats.
- **Props:** fish crates on ice, meze trays, lantern strings, buckets, rods on the quay wall.
- **Palette:** white and blue ice, lantern red-gold, sea green.
- **Ground:** setts and wet quay. **Water:** Marmara quay.
- **Light:** night with sea mist (no flashing).
- **Roster:** walker, runner, bloater, spitter. Skins: waiter, fisher, musician.
- **Twist:** melting ice leaves slow puddles. Fish crates burst with gas when shot (bloater chain).
- **Stage 3:** the fish-ice cart at the quay. The fishing boat waits at the quay (survive.boat).
- **Stage 4:** a musician zombie plays a looping tune. It is the boss cue.
- **Boss:** The Fish Porter. Bloater. Carries crates. Gas crate bursts. Ice-block throw leaves a
  slow pool. Drops the Olta (future weapon).
- **Story beat:** the last meze on the quay. The sea.

### H10 · Laleli (Fatih, km 7.8, L46–50)

- **Scene:** wholesale street with cartons stacked on pavements. Shop windows full of mannequins.
  Sodium streetlights.
- **Props:** fabric rolls, carton stacks, luggage shop displays, clothes racks, bags on hooks.
- **Palette:** sodium orange, grey cartons, pastel fabrics.
- **Ground:** asphalt and tiles. **Water:** none.
- **Light:** deep night, sodium streetlights.
- **Roster:** walker, runner, brute, crawler. Skins: shopper, hamal, shopkeeper.
- **Twist:** dormant mannequins. A mannequin is a dormant zombie. It wakes when Arda passes within 3 m.
  Wake-up is a shape change, not a flash.
- **Stage 3:** the mannequin wake (a surprise beat).
- **Stage 4:** the fabric lane (zombies hide behind rolls).
- **Boss:** The Wholesaler. Brute. Throws crates (lob telegraph). Summons a wave of five mannequins that
  wake together.
- **Story beat:** "Are they zombies?" (narrative, Laleli and Aksaray).

### H11 · Aksaray (Fatih, km 8.6, L51–55)

- **Scene:** a bus-stop plaza at a busy junction. Generic minibuses and taxis in neutral colours.
  Bus shelters. Traffic cones. Pide bakery with an oven.
- **Props:** minibuses (no livery), taxis, bus shelters, traffic cones, kebab grills, pide peels.
- **Palette:** asphalt grey, taxi yellow (generic), bakery cream.
- **Ground:** asphalt. **Water:** none.
- **Light:** night. Headlights as lane markers (no flashing).
- **Roster:** walker, runner, brute, bloater, spitter. Skins: commuter, driver, worker.
- **Twist:** moving minibuses in the lanes are hazards. A pass-through hits for damage.
- **Stage 3:** the traffic lanes.
- **Stage 4:** the campfire rest in a closed bakery. Arda admits his crush on Mila. Kaan teases him,
  then goes quiet. (Triangle seed.) No combat in the rest.
- **Boss:** The Dolmuş Driver. Brute. Horn-telegraphed lane charge. Door swing. Stop-and-go pattern.
- **Story beat:** the campfire. Kaan goes quiet.

### H12 · Yenikapı (Fatih, km 9.5, L56–60)

- **Scene:** underground station hall. Tiled walls with bands. Ticket gates. Stopped escalators.
  Safety barriers. Luggage.
- **Props:** ticket gates, escalators, barriers, luggage, flickering fluorescent (under 3 Hz).
- **Palette:** cream tiles, blue steel, cold white light.
- **Ground:** tile and concrete. **Water:** none.
- **Light:** underground. Torch radius 6 m (night modifier stacked). Stage 3 is a power cut.
- **Roster:** walker, runner, crawler, brute, bloater. Skins: commuter, worker, conductor.
- **Twist:** torch light only. Sound radar (Kulaklık, future passive) matters here. No signal, so
  calls drop.
- **Stage 3:** the power cut. Light the way (O5).
- **Stage 4:** the stairs. Escort her down them (escort).
- **Boss:** The Evening Crowd. Brute made of commuters. Sends crowd waves from the stairs. Keep the
  torch on it.
- **Story beat:** no signal. Mom's call drops for good in the tunnel.

### H13 · Samatya (Fatih, km 10.3, L61–65)

- **Scene:** a sea promenade with a stone sea wall, benches and abandoned picnic blankets.
- **Props:** picnic blankets, benches, lifebuoy rings (generic), fishing rods on the rocks,
  tea glasses on a table, sunrise.
- **Palette:** dawn pink, gold, Marmara blue, red-and-white check blankets.
- **Ground:** promenade stone and sand edge. **Water:** the Marmara.
- **Light:** night to pre-dawn at stages 1–4. Stage 5 is sunrise over the sea.
- **Roster:** walker, runner, spitter, crawler. Skins: waiter, granny, fisher.
- **Twist:** the sunrise is a timer in the story, not in the rules. No damage from light.
- **Stage 3:** the blanket field. Zombies stop at blankets. Cats hiss.
- **Stage 4:** the sea wall. Knockback into the sea (no animal harm).
- **Boss:** The Grill Man. Spitter. Ember spit (2 s burning patches). A smoke cloud hides him. Drops
  the Chestnut Brazier idea (future weapon).
- **Story beat:** the radio says "safe zones". It also says "stay away from the north".

### H14 · Yedikule (Fatih, km 11.1, L66–70)

- **Scene:** old city walls and towers, shown with respect. Gardens and a tea garden inside the walls.
  Ivy on stone.
- **Props:** wall walks, tea-garden tables, hooks with keys, gates, ivy.
- **Palette:** stone ochre, ivy green, morning blue.
- **Ground:** gravel, grass, stone. **Water:** sea walls in the distance.
- **Light:** sunrise, then morning light.
- **Roster:** walker, runner, brute, crawler, spitter. Skins: gardener, worker, granny.
- **Twist:** keys open gates (O8). Narrow wall-walk corridor.
- **Stage 3:** find three keys to open the gate.
- **Stage 4:** the tea garden. Tables block the lanes.
- **Boss:** The Key Keeper. Brute with the ring of keys. Drops the keys on death (gate unlock).
- **Story beat:** the walls held the horde before. They hold again.

### H15 · Kazlıçeşme (Zeytinburnu, km 12.0, L71–75)

- **Scene:** a seaside running path with old rails. Lawns and benches. Sprinklers running.
- **Props:** sprinkler hoses, benches, rail sleepers, kiosks (generic), string lights (dim).
- **Palette:** green lawn, blue sea, rust rails.
- **Ground:** asphalt path and grass. **Water:** Marmara.
- **Light:** morning, warm.
- **Roster:** walker, runner, spitter, bloater, crawler. Skins: jogger, picnicker, fisher.
- **Twist:** sprinklers make ground wet. Wet enemies take extra lightning damage (Live Cable).
- **Stage 3:** the sprinkler lanes. Stand in the wet lane and wait for a cable hit.
- **Stage 4:** the running path. Joggers come in packs.
- **Boss:** The Hose Man. Spitter. Acid spray from a hose (long line, then puddles).
- **Story beat:** a calm morning, then the hose.

### H16 · Zeytinburnu (Zeytinburnu, km 13.0, L76–80)

- **Scene:** textile workshops and yards. Brick and concrete. Dye colours on drums.
- **Props:** fabric bales, conveyor belts, dye drums (teal, magenta, yellow), pallets, forklifts (generic).
- **Palette:** industrial grey and brick, with dye-colour accents.
- **Ground:** concrete with paint. **Water:** canal and sea in the distance.
- **Light:** morning, clear, with haze.
- **Roster:** walker, runner, bloater, brute. Skins: worker, shopper, student.
- **Twist:** dye drums explode in chains (O10). Conveyors push the player.
- **Stage 3:** the conveyor.
- **Stage 4:** the drum yard.
- **Boss:** The Dye Foreman. Bloater. Sprays dye gas clouds. Gas explodes in chains. Pop the drums to
  win the phase.
- **Story beat:** the foreman's last shift.

### H17 · Bakırköy Çarşı (Bakırköy, km 14.0, L81–85)

- **Scene:** an old shopping arcade, half empty. Dust beams from the skylight. Next door: an old high
  school with a playground fence.
- **Props:** shuttered shops, dead escalators, shopping carts, school lockers, a school bell,
  a lost-cat poster (no harm to animals).
- **Palette:** 90s mall pastel, dust beige, school blue.
- **Ground:** terrazzo and tile. **Water:** none.
- **Light:** morning daylight through skylights (no flashing).
- **Roster:** walker, runner, brute, spitter, bloater. Skins: shopper, student, shopkeeper.
- **Twist:** dead escalators are one-way ramps. The school bell calls a spawn wave.
- **Stage 3:** the bell (O9). Ring the bell to push the horde back.
- **Stage 4:** the arcade. Shut the gates (O11).
- **Boss:** The Principal. Brute with a megaphone (cone telegraph). Summons a "detention" line of
  runners. The bell is the trigger.
- **Story beat:** Arda's old high school. A classroom note.

### H18 · Bakırköy Sahil (Bakırköy, km 15.0, L86–90)

- **Scene:** a seaside promenade with palms (generic), benches and a bike lane. An ice-cream cart with a bell.
- **Props:** ice-cream cart (no brand), benches, lifeguard tower (no official mark), bike racks.
- **Palette:** pastel seaside, blue and white.
- **Ground:** promenade paving. **Water:** Marmara.
- **Light:** late morning.
- **Roster:** walker, runner, crawler, bloater, spitter. Skins: jogger, picnicker, fisher.
- **Twist:** the cart bell is an audio warning before a spawn. No children appear as zombies.
- **Stage 3:** the bell chimes before every spawn. Learn the rhythm.
- **Stage 4:** a horde from the bike lane.
- **Boss:** The Ice-Cream Man. Bloater. Freezer burst (cold cloud). Bell chime summons. Cone spray.
- **Story beat:** a kind man gave Arda an ice cream once. Now he is the boss.

### H19 · Ataköy Marina (Bakırköy, km 16.2, L91–95)

- **Scene:** a marina with masts, pontoons and a dock. Cafés with umbrellas. No national flags.
- **Props:** masts, dock ropes, bollards, pontoons, marina cafés, life rings.
- **Palette:** white hulls, teal water, morning gold.
- **Ground:** pontoon boards and dock stone. **Water:** marina basin.
- **Light:** morning.
- **Roster:** walker, runner, crawler, brute, bloater, spitter. Skins: sailor, jogger, shopper.
- **Twist:** pontoons tilt (moving floor). Ropes make net traps.
- **Stage 3:** the pontoon bridge.
- **Stage 4:** the rope nets. Zombies get stuck.
- **Boss:** The Yacht Owner. Brute. Dock chain swing. Horn telegraph. Summons sailors. Drops the Vapur
  Halatı (future weapon).
- **Story beat:** home is close now. The sea is on both sides.

### H20 · Ataköy (Bakırköy, km 17.0, L96–100)

- **Scene:** apartment blocks in beige stucco with blue shutters. A bakery. The kapıcı booth in the lobby.
  Laundry lines on balconies.
- **Props:** laundry lines, bread baskets, kapıcı booth with keys, the lobby door, Arda's electric
  scooter, pot plants.
- **Palette:** warm stucco beige, blue shutters, green lines, morning gold.
- **Ground:** pavement and tile. **Water:** the sea from the top floors.
- **Light:** morning in the lobby, dawn light in the courtyard at stage 5.
- **Roster:** walker, runner, crawler, brute, bloater, spitter. Skins: neighbor, granny, jogger, student.
- **Twist:** doors open. Zombies come out of neighbours' doors (the old door-spawn rule, L1).
- **Stage 3:** the stairwell. Open the shutter terminal (hack.gate).
- **Stage 4:** the courtyard with the laundry lines. Keys (O8) open the lobby.
- **Boss:** Sayın Abim (story name Ahmet Abi), the kapıcı. Brute. Keys ring sweep. Bread basket is a shield. The fight is sad,
  not gory.
- **Story beat:** home. Dad's Letter #1. The apartment is empty. Mila knocks at the door (L100).
  Cliffhanger (see section 8).

---

## 6. Difficulty across 100 levels

### 6.1 The rule that matters

In-run power resets every level (GD §3). A player brings only the meta (hero levels, Workshop,
gear, skills) into a level. So the 100-level curve is **enemy power vs. meta power**. A curve built
on in-run cards alone will not work. The bot can test it only once the meta exists in the bot.

### 6.2 Enemy scaling

E2's current curve (`C.levels.diff`, in progress) uses level index `k = index − 1`:

- HP multiplier `1 + 0.035k + 0.0009k²`
- Damage multiplier `1 + 0.008k`
- Spawn multiplier `1 + 0.006k`, capped at 2.2

| Level | k | HP multiplier (E2) | HP multiplier (GD §4.6, linear 0.10) |
|---|---|---|---|
| L1 | 0 | 1.00 | 1.00 |
| L10 | 9 | 1.39 | 1.90 |
| L25 | 24 | 2.36 | 3.40 |
| L50 | 49 | 4.88 | 5.90 |
| L75 | 74 | 8.52 | 8.40 |
| L100 | 99 | 13.29 | 10.90 |

**Proposal (for the bot to test):** switch the level term to a hood term plus a stage term. Hood
scaling is easier to explain and to balance by hood.
`hpMul = (1 + 0.08 × (hood − 1)) × stageMul`, with stageMul 1.00 / 1.05 / 1.10 / 1.15 for stages 1–4.
This gives about 2.5× at H20 stage 5 (before the boss HP, which is explicit). E2 would reach 13×. The
meta has to match whichever curve is picked. Owner and lead decide (open item 9.6).

### 6.3 Clear-rate targets (first attempt)

These bands follow GD §7 and stretch it to 20 hoods.

| Hoods | Levels | Stages 1–4 | Stage 5 (boss) | Notes |
|---|---|---|---|---|
| H01–H02 | L1–10 | ≥ 95% (L1–4), 85–90% (L6–9) | L5 ≈ 90%, L10 ≈ 85% | Teach. Mostly tutorial. |
| H03–H04 | L11–20 | 80–90% | L15 ≈ 75%, L20 ≈ 70% | Bridge boss plus Kaan join. |
| H05–H06 | L21–30 | 75–85% | L25 ≈ 70%, L30 ≈ 65% | Build milestone at L30, not a chapter end. |
| H07–H10 | L31–50 | 70–85% | 60–70% | Bazaar and Beyazıt are the hardest stages in the slice's far half. |
| H11–H16 | L51–80 | 70–85% | 60–70% | Stage 4 holds are the spike. |
| H17–H20 | L81–100 | 65–80% | 55–65% | Final hoods. Sayın Abim is the emotional spike. |

Sawtooth rule: the boss is the peak. The next stage 1 is the relief (80% spawn rate).

### 6.4 Session shape

- One level = one run, 3:00–6:00.
- One hood = 5 levels = about 20–28 min including the map walk and the comic page.
- Chapter 1 = about 7–9 h for a first pass, with deaths and replays.
- Map walk after each level (results → map, see weapons-skills and story-presentation) gives
  a pause for the story and a reason to keep going.

### 6.5 Bot result (v0.6, 2026-11-08)

> Measured before the v0.8 reorder. Level numbers in the tables below use the old order (L50 was the Aksaray boss, L75 the Zeytinburnu boss). Re-run the bot before quoting them.

Run: `node prototype/tools/bot.js --levels=25,50,75,100 --seeds=6` (expected loadout, section 7.5 of attributes.md), with `--bare` and `--nonew` for comparison. Targets are the floors from section 6.3.

| Level | Target (clears of 6) | Baseline, bare (v0.5) | Bare, v0.6 enemies | Expected loadout, v0.6 (shipped) |
|---|---|---|---|---|
| L25 | 5 | 5 | 1 | 6 |
| L50 | 4 | 2 | 2 | 5 |
| L75 | 4 | 0 | 0 | 6 |
| L100 | 3 | 0 | 0 | 3 |

The `--nonew` run (no schedule, no affixes) reproduces the baseline exactly (5, 2, 0, 0), so the bare drop at L25 is the new enemies. The shipped player clears every floor. L75 is above its floor with room to spare; the owner asked for "roughly", and a stronger player is the stated direction.

---

## 7. Unlocks: weapons and passives by level

Unlocks follow `config-weapons.js` (`C.unlock`, E1, in progress). The table shows the level and the
hood-stage it falls on. Future items (not in the slice) are in [weapons-skills.md](weapons-skills.md) §5 and §6.

| Level | Hood · stage | Enters the card pool | Story reason |
|---|---|---|---|
| L1 | H01 · 1 | Döner Knife (signature), Nail Gun, Gas Canister, Bike Chain, Sledgehammer, Nazar Charm, Running Shoes, Leather Jacket, Work Gloves, Energy Drink, First Aid Kit | Start kit (D-017). Sledgehammer and Nazar are in the start pool in config. |
| L3 | H01 · 3 | Molotov (Benzin Şişesi) | Bottles on the stairs (see note 7.1) |
| L6 | H02 · 1 | Fire Extinguisher (Yangın Söndürücü) | Shops on Galata. Config unlock L6 (shift from the Kapalıçarşı idea). |
| L8 | H02 · 3 | Magnet (Mıknatıs) | Pulled from a tram-stop or station magnet. |
| L11 | H03 · 1 | Speargun (Zıpkın) | Wedding café fishing gear. Config unlock L11. |
| L16 | H04 · 1 | Fireworks (Havai Fişek) | The convoy. Bridge pickups. Config unlock L16. |
| L21 | H05 · 1 | Live Cable (Canlı Kablo) | Tram wires and pier cables. Config unlock L21. |
| L5 | H01 · 5 (boss) | Boss chest (evolution or upgrades) | Vatman chest |
| L30 | H06 · 5 (boss) | Build milestone (not chapter end). Boss chest. | Ticket Man |

**Notes**

- **7.1** The config puts Molotov at L3 and Live Cable at L21. Section 5 places Live Cable on H01 stage 4.
  The story reason in the table is the one that matches the config. The lead picks one (open item 9.5).
- **7.2** Passives: Nazar at L1 and Magnet at L8 in config. The first evolution (Usta's Cleaver, knife +
  gloves) is available at L5 when the boss chest opens.
- **7.3** The first hood boss (L5) is the first real evolution chance. Stage 5 chests give evolutions
  (CC §9, GD §5.5).

---

## 8. Mapping to the existing docs (the chapter change)

### 8.1 What changes

| Doc | Old | New (D-027) |
|---|---|---|
| [prd.md](prd.md) §1, §4 | Levels 1–30 = "3 districts × 10" (İstiklal → Karaköy & Galata → Galata Bridge) | **Levels 1–30 = hoods 1–6** (İstiklal → Sirkeci). Sirkeci (L30) is a build milestone. Chapter 1 ends at Ataköy (L100, D-040). |
| [prd.md](prd.md) §4 | Kaan joins in L30 | Kaan joins at L20 on the bridge (proposed, open item 9.1) |
| [product.md](product.md) §5 | Chapter = 10 districts × 10 levels, x5 mini-boss, x0 district boss (D-001) | **20 hoods × 5 levels**; stage 5 of every hood is a boss. D-001 amended by D-027. |
| [game-design.md](game-design.md) §6 | District template: Route, Arena, Route, Arena, Mini-boss, … | **Hood template** (section 3 here). The 10-level district table is superseded. |
| [content-catalog.md](content-catalog.md) §6–§7 | L5 Kestaneci, L10 Vatman, L15 Tour Guide, L20 Bride, L25 Big Fisherman, L30 Kaan | Bosses sit at stage 5 of their hood: L5 Vatman, L10 Tour Guide, L15 Bride, L20 Big Fisherman (Kaan joins), L25 Captain, L30 Ticket Man. Kestaneci becomes a stage-3 cart charge on H01, not a boss. |
| [narrative.md](narrative.md) *Chapter 1* | 10 district arcs at levels 1–10, 11–20, … | Same arcs, mapped to hood ranges (narrative.md *Chapter 1* table). Ending unchanged. |
| [design-system.md](design-system.md) §9.2 | Cliffhanger at L10, L20, L30, L100 | Cliffhanger at hood ends H01 (L5), H04 (L20), H06 (L30) and L100. |
| [prd.md](prd.md) §4 | Motion comics at L10, L20, L30 | Comic page at the end of each hood (20 pages in Chapter 1). Full 5-panel pages on story hoods. See [story-presentation.md](story-presentation.md). |

### 8.2 Narrative arcs on the map

Old arcs are blocks of ten levels. The new blocks are by geography. Each arc keeps its beats.

| Arc (narrative.md) | Hoods | Levels | Key bosses |
|---|---|---|---|
| A. İstiklal & Galata | H01–H02 | L1–10 | Vatman (L5), Tour Guide (L10) |
| B. Karaköy & the Bridge | H03–H04 | L11–20 | Bride (L15), Big Fisherman (L20), **Kaan joins** |
| C. Eminönü & Sirkeci | H05–H06 | L21–30 | Captain (L25), Ticket Man (L30, build milestone) |
| D. Grand Bazaar & Beyazıt | H07–H08 | L31–40 | Carpet Golem (L35), Pigeon Man (L40) |
| E. Laleli & Aksaray | H10–H11 | L46–55 | Wholesaler (L50), campfire (L54), Dolmuş (L55) |
| F. Kumkapı & Yenikapı | H09 and H12 | L41–45 and L56–60 | Fish Porter (L45), Evening Crowd (L60). Not contiguous now: Laleli and Aksaray sit between (open item 9.9) |
| G. Samatya & Yedikule | H13–H14 | L61–70 | Grill Man (L65), Key Keeper (L70) |
| H. Kazlıçeşme & Zeytinburnu | H15–H16 | L71–80 | Hose Man (L75), Dye Foreman (L80). Order flipped in v0.8 |
| I. Bakırköy | H17–H18 | L81–90 | Principal (L85), Ice-Cream Man (L90) |
| J. Ataköy | H19–H20 | L91–100 | Yacht Owner (L95), Sayın Abim (L100; story name Ahmet Abi, D-039), Mila at the door |

### 8.3 Cliffhanger

L100: a knock on the door. Arda raises the knife. It is Mila. Freeze, then the triple zoom (DS §9.2).
Chapter 2 starts at L101 as in narrative.md.

### 8.4 Dad's letters (collection gates, AUDIT-7 CR-8)

The 100-level walk cannot reach the narrative gates (L190 and L300). The gates below stay inside Chapter 1 and unlock on
the win of that level (`js/meta/meta-collect.js`, `C.LETTERS`). Canon positions are in narrative.md (Season-Long Mysteries).

| Letter | Gate | Stop | Narrative canon | Rule |
|---|---|---|---|---|
| #1 | L100 | Ataköy flat (the L100 boss, Ahmet Abi) | Letter #1, the empty flat | Unchanged. The finale reads it (`fin_arrive_b`). |
| #2 | **L190** (Chapter 2) | Chapter 2 | Letter #2, Sarıyer and the drive north | Kept in Chapter 2 (owner canon: Chapter 1 ends with letter #1 at L100). |
| #3 | **L300** (Chapter 3) | Chapter 3 | Letter #3 (İzmir) | Kept in Chapter 3. |

Open: the walk order puts letter #3 (L95) before letter #1 (L100). Renumbering or moving letter #1 is an owner decision (table 9.14).

---

## 9. Open decisions for the owner

| # | Decision | Recommendation | Why it matters |
|---|---|---|---|
| 9.1 | **Kaan joins at L20** (bridge boss) instead of L30 | **DECIDED 2026-11-08 (D-045): L20.** He is on the bridge in the story and must be there for the Captain beat in Eminönü (L25). | Moves a story beat and the squad unlock. Changes prd §4, content-catalog §6 and narrative.md *Characters*. |
| 9.2 | **Build milestone at Sirkeci (L30)** instead of the Galata Bridge | Keep L30 as the vertical-slice build milestone (six hoods, a full arc, two bosses with comics). Chapter 1 ends at Ataköy (L100, D-040). | prd §1 and §4 change. |
| 9.3 | **20 bosses, one per hood** (stage 5) | Yes, with a per-hood signature attack. Three boss types are a shared kit. | Art and animation load. 20 concepts × 2–3 attacks. |
| 9.4 | **Route order and geography** | **Applied in v0.8 (lane L):** Kumkapı after Beyazıt; Zeytinburnu and Kazlıçeşme swapped. The owner confirms against a real map before the art pass. | A local player may notice. Map, km and levels follow the new order. |
| 9.5 | **Molotov name and unlock** | Display name "Benzin Şişesi" (petrol bottle). The word molotov has a political meaning in Turkey and elsewhere. Keep "molotov" in code IDs. | Guardrails (no politics). See weapons-skills §4. |
| 9.6 | **Difficulty curve** | **DECIDED 2026-11-08 (D-041, D-042):** keep E2. The player gets a persistent power lever (attributes.md section 7.5), and new enemy types and affixes carry the late game. The hood-based curve is not used. Bot result: section 6.5. | 13× HP at L100 may be too steep without meta. |
| 9.7 | **Boss names** | **DECIDED 2026-11-08 (D-046):** one set, the `spk.b.*` names in `strings-story.js`, Turkish with the section 2 canon role as the English gloss. Ataköy is Sayın Abim. The E2 names are retired (table 9.8). | Strings and comics. |
| 9.9 | **Arc F is not contiguous** (Kumkapı L41–45, Yenikapı L56–60; Laleli and Aksaray sit between) | Keep F and write its beats across the two stops, or pair Kumkapı with Beyazıt in the arc. | Narrative lane. narrative.md assumes Kumkapı comes after Aksaray. |
| 9.10 | **Story keys follow the walk position** (H##i#, barks, HOOD_LOOK, PAGE_MID) | Positions 9–11 and 15–16 now hold Kumkapı, Laleli, Aksaray, Kazlıçeşme and Zeytinburnu. Re-key the story lane's entries to match. The list is in the v0.8 hand-off. | Without it the wrong scene plays on the wrong hood. |
| 9.11 | **Campfire rest** (PAGE_MID) | Moves from L49 to L54, the Aksaray stage 4 (closed bakery). | Story lane. |
| 9.12 | **Marmaray at Zeytinburnu and Bakırköy** | Zeytinburnu has no train in `journey.js`. Bakırköy lists one (`marmaray`). No train wait is assigned at either hood until the station is confirmed. | Fact check. Sirkeci, Yenikapı and Kazlıçeşme train waits are in the data. |
| 9.13 | **Ataköy Marina before home** | Kept before home for the story (Dad's Letter at the end). | Story order. |

### 9.8 Boss name reconciliation

The canonical name is in section 2. The E2 code names were removed from `config-levels.js` in v0.6 (D-046). The in-game set is the `spk.b.*` names. This table is the reconciliation record.

| Hood | Canonical | E2 code name | Note |
|---|---|---|---|
| H01 | The Vatman | Hamal Dev (Giant Porter) | Canonical from narrative.md |
| H05 | The Captain | Demirci Kemal (Blacksmith Kemal) | Canonical from narrative.md. Kaan's beat. |
| H06 | The Ticket Man | Tokmakçı (The Sledgehammer) | "Tokmakçı" is a hammer seller. Could keep for the sledgehammer link. |
| H07 | The Carpet Golem | Tellal Nuri (Auctioneer Nuri) | Canonical from narrative.md |
| H12 | The Evening Crowd | Limancı Ali (Harbor Ali) | Canonical name avoided: "Rush Hour" is a film title. |
| H13 | The Grill Man | Teyze Zehra (Auntie Zehra) | |
| H17 | The Principal | Manav Ramazan (Greengrocer) | Canonical from narrative.md |
| H20 | Ahmet Abi | Muhtar Sadık (Headman Sadık) | **Owner decision 2026-11-08 (D-039):** Sayın Abim (EN: The Honourable Big Bro). |

Other E2 names (Kasap Hasan, Pehlivan, Balon Adam, Şoför Rıza, Tuzlu Ağa, Güvercin Amca, Valiz Ahmet,
Bahçıvan Kadir, Kazan Hüseyin, Mangal Fatma, Şişme Can, Kaptan Osman) can stay as alternates. The lead chooses.

---

## 10. Guardrail check

| Topic | Rule (narrative.md) | How the journey meets it |
|---|---|---|
| Real state actors, police, military | No | No police, no soldiers, no bekçi. The Key Keeper is a fortress caretaker. |
| Earthquake imagery | No | Pavement pops and dust puffs only. No ground cracks, no building collapse in a quake style. Scaffold drop is one hoarding falling. |
| Religion as a target | No | No religious building as a target or a boss. Domes and towers are background only. |
| Politics | No | No molotov name in the UI (section 9.5). No flags. No slogans. |
| Real brands, crests, transit livery | No | Generic red tram, generic yellow taxi, generic minibus, fictional shop names. |
| Landmarks | Shown with respect | Tower, walls, bridge, bazaar, Marmara shore shown as generic silhouettes. |
| Animals | Never harmed | Pigeons scatter, cats hiss, gulls fly. Fish is food, not a victim. Knockback into the sea harms zombies only. |
| Flashes | 3 per second max | Fireworks, lightning, flicker and fog are timed under 3 Hz (see wow-catalog §6). |
| Gore | No close-ups | Bodies collapse. Blood is red by default (D-024). No cut-away gore. |
| Children as zombies | Not in the brief | No child skins or boss. Picnic and sea hoods use adults. |
| New enemy types (v0.6) | Zombies only (violence and gore rules) | Kasap, parkur and zehirli are zombies. Affix marks are shapes and colour. No new human enemy in Ch1. Gore rule unchanged: no close-ups. |
