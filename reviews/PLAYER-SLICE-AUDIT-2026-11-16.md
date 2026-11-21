# Project Istanbul player audit · 16 November 2026

**Scope.** The Normal browser campaign from a fresh save through Bölüm 30, covering the first six neighborhoods and the systems a player encounters along the way. I exercised the Turkish campaign in a phone-size Chrome window, used wider Chrome layouts for the Weapon Lab, and ran every in-game comic in Turkish and English. The campaign used simulated steering and accelerated play after the first input. The player-facing renderer, menus, saves, rewards and finale still ran in the browser. Seeded runs exercise a different route and build mix. They help find stalls and difficulty spikes. They cannot measure enjoyment or predict retention.

The [follow-up world and combat audit](WORLD-COMBAT-AUDIT-2026-11-16.md) covers the street systems and boss finishes across the campaign, including the Ataköy reports in Bölüm 96.

**Quality bar.** Use the Survivor.io reference for the urge to try one more build, with changing pressure and a reward worth reaching. Use Hades for attack anticipation, unmistakable contact, satisfying recovery and characters whose relationships change because of the journey. Istanbul can earn that replay value with shorter, authored street encounters, character-led objectives and weapons rooted in the setting. [Survivor.io](https://apps.apple.com/us/app/survivor-io/id1528941310) · [Hades](https://www.supergiantgames.com/games/hades/)

## What changed in this pass

| Finding | First-hand evidence | Implemented |
|---|---|---|
| The designed campaign rhythm was gated behind the test URL | The ordinary map and preview led to different route rules. The improved route came with zero currency and no persistent clear in preview. | Normal play now gets the authored routes through Bölüm 30 with saves and earned rewards. The explicit preview stays isolated and the old route remains available for comparison. |
| The opening asked the player to read too much | The three ability buttons competed with the first movement prompt and Arda. | The first run brings in Dash after moving and collecting XP, the selected weapon action after the first card, and the ultimate on the street or when charged. The corresponding input opens at the same time. |
| Training broke the handoff from map to live combat | Route screenshots showed the training dialog and dialogue layered over a moving run after leaving the first-clear map. | Map exit cancels training and invalidates late return, welcome and toast callbacks. Results link directly to Arda’s growth screen when an upgrade is available. |
| Farming was still an attractive way to play Galata | In the same fresh campaign seed, the early browser pass on Bölüm 9 recorded 2,986 kills. The final pass recorded 861. | The available street waves now depend on distance traveled. Pressure falls around the required interaction, and the authored end hold still happens. |
| Two İstiklal bosses punched above their place in the learning curve | Seeded Makasçı losses came with a separate movement stall next to a repeating tram shelter. Vatman cleared in only three of the first five seeds. | Removed repeating solid shelters from that section of Bölüm 2, softened Makasçı and Vatman, and gave each longer punish windows. |
| Sirkeci repeated the same visual layer across the entrance and control point | The generic mid-route station arch cut through the ring in Bölüm 29. The parked car could also trap one route seed beside a booth after it had left. | Removed the repeated arch from this route, used the illustrated station walls, and removed the railcar’s collision as it departs. Rings and props share world coordinates. |
| A required objective competed with its own horde announcement | Very large letters crossed the Sirkeci light controls during the oncoming wave. | When the active mandatory checkpoint already explains what is happening, the horde retains its movement cue and sound. The large banner stops covering it. |
| The chapter handoff gave away a later beat | The earlier Sirkeci call sent Arda to Sarıyer and compromised the later Ataköy reveal. The previous route’s line could also play in the following level. | Mom mentions Dad’s note through the failing signal. Kaan and Arda have independent lines for each Sirkeci route. The Captain also gets an aftermath scene before they leave Eminönü. |
| Rank 1 handling was hard to see under enemies | The nail gun’s firing hand lost its brief cue. The chainsaw bar and hammer head were small enough to disappear before contact. | The nail gun cue lasts longer and grows. Nailstorm has its own color. The chainsaw and sledgehammer have sharper profiles and more deliberate changes in body position before and after contact. Damage and timing are unchanged. |
| The quay hinted at a healing kiosk beyond the locked crane gate | An automated replay abandoned the second crane control for a kiosk on the far side of the barrier. It could reach the control with the proper route. | The healing hint now becomes available when the gate opens. Automated steering uses the same accessibility test. |
| The title and gameplay comics felt like different games | A flat skyline and placeholder crowd greeted the player. | The title now uses an illustrated Arda, street and tram in the game’s current graphic-novel style. |
| A late phone call could follow the player into the next screen | A call queued by a run stayed alive after its speaker and scene had changed. | Winning, relaunching and returning to the map clear the old dialogue and discard deferred lines for that run. |

## The whole route, chapter by chapter

These observations are about the player’s next decision, visual feedback and story context. The named action is the designed route, with encounters and shadows observed through browser captures and sim traces. Beating a route with scripted steering does not establish that a first-time player understood it.

| Bölüm | Player action and payoff | What to watch in a first-time play |
|---|---|---|
| 1 · İstiklal | Drag, survive the restaurant, take the first card, cross the street and fight the cook before leaving. The lower camera angle and table legs help the restaurant read as a room. | This is still the busiest storytelling stretch. Watch whether someone finds the exit after Mom’s first call while still learning XP pickups and Dash. |
| 2 · İstiklal | Hold the connection, see the incoming crowd gather, let the tram clear the crossing, then survive the Makasçı fight. | The tram is the reward and should be watched from safety. Check whether a new player recognizes that the crossing becomes walkable before seeking the next fight. |
| 3 · İstiklal | Carry the signal booster through the crossing, then fight the roaster. | Check whether the handoff from the booster to the route feels like forward movement. Heat and fire effects can compete with hazard cues. |
| 4 · İstiklal | Reach three utility points and cut their cables. The camera moves closer for the cutting action before the linekeeper finish. | The count and ring answer what to do. The player should see each cut take effect before the next marker appears. |
| 5 · İstiklal | Open the depot, handle a warned frenzy and learn Vatman’s attacks. The outro lets the district finish on a story beat. | The earlier fight asked for too much damage uptime. Check whether the longer opening is visible enough to invite a deliberate counterattack. |
| 6 · Galata | Work the hoist and take the street route around a barrier. The mosque sits on a single, fixed street-side footing. | The hoist’s movement should identify the route it opened. Keep a watch on damage from behind after the player stops to look. |
| 7 · Galata | Meet and follow the musician. Clear the threats pinning the guide, then go through together. | The musician’s behavior sets the pace. Someone who keeps running ahead needs to recognize that turning around helps. |
| 8 · Galata | Ring a bell and see the crowd turn aside. Move while attention is elsewhere. | The horde turning is the payoff. Check whether walking into the new path feels more rewarding than finishing the distracted crowd. |
| 9 · Galata | Pick up the counterweight, fit it at the footbridge and cross. The end hold is longer than the earlier holds. | The run once stretched into several thousand kills. This is the most important stationary-farm retest and the hardest Galata route in the seeded batch. |
| 10 · Galata | Open the courtyard and face the Bellkeeper. The warning circles mark falling weights and demand a change of position. | The boss has a threat specific to this space. Check whether the player sees where the weight will land during a dense wave. |
| 11 · Karaköy | Align the crane hook at one station, move to the second station and clear the freight quay. | The second station takes over the HUD when the hook aligns. A healing kiosk behind the closed gate now waits for that gate to open before offering a hint. |
| 12 · Karaköy | Unmoor the ferry and protect the line through a nine-second hold with threats arriving from opposite ends. | This tests alternating sides while keeping a position, a useful change after the crane. Check whether the later wave actually makes the player turn. |
| 13 · Karaköy | Switch track points so the freight tram clears a path. | This should evoke the earlier tram with less story interruption. The earlier seeded pass used a revive in every run and still lost one, making the approach worth unassisted observation. |
| 14 · Karaköy | Raise three market shutters on alternate sides of the street. Watch each opening take effect. | The alternating path creates movement rather than one long defense. Check whether the count stays meaningful if the player reaches a later shutter first. |
| 15 · Karaköy | Clear the loading-ramp guards, hold the ramp and face the Bride. Mom’s interrupted call puts a personal beat in the crossing. | The Bride’s attack timing should carry the tension after the ramp. An unassisted player should be able to describe the next safe opening. |
| 16 · Galata Köprüsü | Reel the snagged rods off the bridge deck and reach the far rail. The scene changes from boxed streets to water, railing and the bridge deck. | Check that the player reads the narrow safe route as part of the bridge and understands what blocks the rest. |
| 17 · Galata Köprüsü | Reach the rescue and lead the person back off the exposed edge. | A rescue should read as a person in danger at first glance. The escort must keep feeling important once the first enemies arrive. |
| 18 · Galata Köprüsü | Use wind screens across the deck. Gust direction changes the best place to stand. | Wind needs to remain visible with audio off. A still screenshot alone cannot judge the force cue or timing. |
| 19 · Galata Köprüsü | Cross through successive timed wave warnings. Know when to wait and when to run. | Environmental danger changes movement more than health totals. Check whether the water warning stays readable through the build’s effects. |
| 20 · Galata Köprüsü | Open the final bridge passage and fight the Fisherman, then see Kaan join. | The fight uses the bridge geometry. The aftermath gives the player a new relationship as well as a district clear. |
| 21 · Eminönü | Raise the roadside stall awning and open the first passage through the quay. The comic and setting establish the waterfront. | The quay path should pull the eye forward when incidental markers, stalls and light strings fill the edges. |
| 22 · Eminönü | Escort the spice cart, clear the enemies jamming it and reach the loading area together. | It is important that the moved obstacle itself tells the player where to go. Optional side tasks should remain visibly optional. |
| 23 · Eminönü | Move sacks to clear the route, then hold off pressure beyond the gate. | The earlier batch’s defeat came after the gate. Check time to recover before the next pack, even when the carry phase goes well. |
| 24 · Eminönü | Signal a freight trolley, watch it cross the route and take the walkway it leaves open. | Watch whether the crossing action reads as freight rather than another arbitrary ring. Strong metal movement and an open path matter more than extra text. |
| 25 · Eminönü | Face the Captain and move on. The new coda shows Kaan remembering what the Captain did for him. | The coda gives Kaan a reason to stay with Arda. It should land after the fight without delaying the player’s return to Results. |
| 26 · Sirkeci | Pull the yard lever, hear the bell, watch a blue service car move up the tracks and advance through the cleared gate. | The bell leads the track-side camera move. The camera follows the service car before returning to Arda and the opening gate. Verify that the player recognizes the lever before approaching the stopped train. |
| 27 · Sirkeci | Meet the attendant, keep them close, clear the enemies that stop them, and let them open the passage. | The attendant stops when threatened and resumes when safe. Illustrated walking frames make that difference legible without a caption. |
| 28 · Sirkeci | Pick up the fuse, take it to the box and restore the high station clock. | The fuse and box must read as separate objects. The rising clock light gives the action a payoff visible from the approach. |
| 29 · Sirkeci | Switch on the lights and hold the ring for eight seconds while two waves approach. Progress pauses outside the ring. | The player can briefly step out to dodge. The ring needs to tell them that their earned time remains when they return. |
| 30 · Sirkeci | Open the last platform and face the Ticket Man. Read his windup, avoid the tracks in order and strike during recovery. The ending points toward home. | In phase two, one track followed by another asks for a second dodge. The pose, preview lane and actual hit should agree. Some scripted clears had very little health left. |

The route sheets use quiet scenes captured at the authored landmarks so the street and object placement are visible. [Route contact sheets for Bölüms 1–15](media/R1/slice-audit/routes-1-15.jpg) · [Bölüms 16–30](media/R1/slice-audit/routes-16-30.jpg) · [Sirkeci actions](media/R1/slice-audit/sirkeci.jpg)

## Combat audit under crowd pressure

Each base weapon was rendered and exercised at Rank 1 and Rank 5 in the same Weapon Lab crowd. Each of the 18 evolutions was exercised separately. I checked motion at Arda’s hand, attack direction and silhouette, impact on enemies, duration and screen clutter. The overview captures show an instant in the attack. They cannot establish whether it feels responsive at real speed on a phone.

| Weapon | Rank 1 read | Rank 5 read and next quality check |
|---|---|---|
| Döner knife | A small, directed close cut gives Arda a readable basic attack. | The larger cut and return motion read at higher rank. Test whether that precision survives alongside chain and saw effects. |
| Bike chain | The strike wraps around Arda with a recognizably curved path. | The larger sweep reads around a pack. Keep the contact concentrated so it remains distinct from the knife and the car door. |
| Blowtorch | Hot narrow jet gives a clear attack direction and avoids hiding the crowd in a smoke cloud. | Broader tongues read as higher pressure. Check whether the incoming enemy silhouette survives behind the hottest part of the cone. |
| Car door | Red panel stays with the hand long enough to infer a swing. | The held rotation and arc are much easier to spot. A future rig pass can give shoulders and feet more visible torque. |
| Chainsaw | A sustained rev and brighter blade distinguish the start from a single swing. Arda braces further before pressing through the target. | Longer contact and a larger bar matter once it engages. More separate body acting during the first bite remains an art opportunity. |
| Fire bottle | The thrown bottle lands before the orange pool opens. | Bigger terrain control reads immediately. Fire is already one of the clearest reasons to replay a build. |
| Fire extinguisher | White nozzle spray begins at the hand, with good contrast against the street. | The broader mist has legible reach. Test whether it preserves the arming line of an enemy in a fully mixed build. |
| Fireworks | Visible launch followed by a colored radial burst. | Burst count and color separation deliver escalation. Check simultaneous volleys at reduced effects and keep the enemy warnings dominant. |
| Fishing rod | The thin line links Arda and the hooked victim before the reel. | The circular pull is much more legible than the line alone. The first hooked zombie needs to read in a mixed crowd without requiring a freeze-frame. |
| Live cable | A short arc lands on visible stylized skeletal reactions. | Branch chains and more reactions across the crowd make the upgrade obvious. Test the reduced-flashing version on the phone for equivalent timing cues. |
| Manhole cover | A distinct disc travels ahead of Arda. It can be missed behind the front row of victims. | The large rebound and metallic outline make the return read. In motion, check whether the landing beat remains attached to the visible cover. |
| Nail gun | Thin, fast shot previously disappeared at the hand. | The muzzle read now scales by rank. Keep the short projectile identity and check Rank 5 for sustained visual noise. |
| Picnic gas can | Throw, visible warning and blast give it three readable beats. | Multiple blasts provide area pressure and a strong payoff. Preserve enough empty space to read imminent enemy attacks. |
| Saw blade | The disc has a continuous travel path and an identifiable metal edge. | A stronger return trail helps explain the boomerang motion. Test whether players can visually follow it back to the catch. |
| Sledgehammer | A larger, outlined head and taller windup let the player follow the early swing into the floor crack. | The gold and blue impact treatment is an obvious jump. A more deliberate low-rank hand motion remains a candidate for an authored animation pass. |
| Slingshot | A readable release and bouncing contact keep it distinct from the nail gun. | The combination of branching projectiles and visible trails earns its place in a mixed build. Preserve the delay between release and contact. |
| Speargun | Blue harpoon cue communicates direction and a lane through enemies. | The wave and multi-pronged silhouette establish the sea theme. At close range the picture risks reading as a spell with an indistinct trigger, so keep the hand pose in future iterations. |

**Evolution check.** Cleaver has a drop, Nailstorm has a spread, Cluster charges multiple blasts, Cyclone grows into a vortex, and Wedding Finale puts color over a much larger area. Forge keeps the hot jet, Grinder keeps the cutting head, Hookpull grows the pull and Minibus Door retains the physical panel. Blacksmith uses a hammer impact pattern, Stormshield shows the electric field, Foamstorm has sustained white spray and Netspear adds a visible binding net. Fire Lake occupies space, Twin Saw multiplies the returning blade, Fireball is a concentrated throw, Arc Chain spreads electricity and Car Bomb Lap carries a moving explosion around the fight. All registered hits. Nailstorm and Grinder still rely most heavily on familiar base motion. A competitive art pass should give those evolutions their own acting and recovery, then check their silhouettes alongside high-ranked base weapons.

[Weapon Lab contact sheet, part 1](media/R1/slice-audit/weapons-1.jpg) · [Part 2](media/R1/slice-audit/weapons-2.jpg)

## Screen-by-screen and system review

| Moment | What the player needs | Evidence and remaining gap |
|---|---|---|
| Title and cold open | Understand that Arda is trying to reach his family and recognize the play button. | The title opens with the new Arda and tram illustration. The restaurant news cut-in still has a simpler treatment than the refreshed comic and streets. |
| First move and first kill | See Arda’s hands and hit direction before reading the HUD. | Camera, contact marker and slower button reveal give the hero room. Verify with a new player who never heard the instructions. |
| First pickup and card | Connect the drop to earned power, then compare two choices quickly. | The first card and build counters work. Compare cards with different tradeoffs, then ask the player to predict the difference. The instrumented run made choices, so it leaves this learning question open. |
| Choice fork and chest | See the chest, understand why it matters and get back into play. | A high-contrast outline and bounce identify it. The opening beat and choice are visible. Continue stays in place and the choice communicates when it is locked. Test rapid taps and mixed-language screen sizes. |
| Core movement and Dash | Maintain movement when the second thumb taps Dash. | Input, mode and pause suites cover wiring. Use physical two-finger testing on iPhone for the tap during a turn, then with a chest or phone prompt nearby. |
| Required action and route state | Find the ring, understand whether it is required and see the physical consequence. | The HUD shows closed, action, opening and clear. The loud horde label no longer covers it. Several waterfront actions still look similar at a glance because they use the same ring grammar. Gestures, props and movement carry the differences. |
| Optional tasks and stars | Know whether skipping a task affects progress or an extra star. | The optional task lives separately from the required passage. Read the result beside the thing the player actually did. The steering prioritizes required actions, so its bonus rate is unsuitable for judging player motivation. |
| Frenzy and recovery | Hear or see the incoming pressure, know how long it lasts and get a breather before the next decision. | The countdown and active HUD communicate state. This remains easier to read on a calm frame than with XP, chest glows and several weapons active. |
| Boss entry | Understand what to dodge before taking damage. | Boss outlines, windups and arcs have identifiable geometry. The automated driver dodges from geometric data, so unassisted observation is needed to tune first-time readability. |
| Health, downs and retry | See whole health numbers and learn what killed Arda. | Health stays in whole numbers. Death labels are localized and the seeded runs recorded revives and failures. Results display a specific cause where available. |
| Map and progression | Know whether to replay, press on or spend points. | First results and the map point at the next level. The growth shortcut sends the player to a usable upgrade rather than a detached page. Training bars and perks share an entry, while character XP and weapon mastery still risk sounding interchangeable. |
| Save and return | Keep the clear and rewards across the next launch without paying out twice. | The Normal route carries real results and the preview remains separate. Repeat a killed tab on iOS during Results and after allocation, where storage and backgrounding differ. |
| Dialogue, postcards and live calls | Read a line without missing the thing it describes. | Captions, full-page comics and mid-run dialogue have different jobs. Sirkeci’s lines now match their level. Run transitions now close the old call. Live speech bubbles appear with the first letter so they no longer look empty during the portrait slide. Observe a real-time fast attempt for any overlap between a valid live call and a boss warning. |
| Comic layout and portraits | Preserve the speaker’s size when dialogue gets long. | All 28 pages were played in both languages. The run measured 86 panels per language and 98 text steps. No overflow or crossing was found. The longest captions still need a second tap, so pace should be judged on device. |
| Visual coherence | Know what is floor, a passable edge and a solid object. | The refreshed station gate, vehicle and actors land with shadows. Older fallback kiosks, clinic façades and street signs still have visibly simpler shading. World art should be assessed in context before an asset replacement lands. |
| Sound and mix | Hear a weapon hit, round warning and a phone line clearly over music. | Browser exercises sound triggers and the app has separate sliders. The furniture, crowd and music mix still needs an audible pass with headphones and iPhone speakers. A successful audio event is evidence of playback state only. |
| Accessibility and layout | Read and move comfortably with less motion, flashing or sound. | HUD layouts and comic text were checked in Chrome. Shapes and text back up color for mandatory checkpoints. Test high-contrast sunlight, one-handed reach, screen-reader behavior around overlays and audio-disabled play on device. |
| Replay and analytics | Have a personal reason to restart, then see whether a new build changes the answer. | Local telemetry records actual card forks, rank, death causes and route version. The user’s phone benchmarks are performance telemetry. An uncoached play session can reveal what someone missed. Voluntary rematches across sessions are the evidence for “one more run.” |

## What remains after this implementation

1. **First-time player evidence.** Test fresh and returning players in real time. Record where they pause, what they think the goal is, which attacks they can identify without the Lab label, whether they credit story or loot for continuing, and whether they voluntarily start another run.
2. **Combat animation production.** The biggest remaining distance from the reference is body motion and recovery under several simultaneous weapons. Build on the stronger rank-1 chainsaw and hammer cues with authored motion frames for the shoulders and feet. Give Grinder and the high-impact evolutions their own full-body performances. The current effects already separate families enough to choose where those poses matter.
3. **Art and sound finish.** The news cut-in and some peripheral street props still have a flatter rendering style than the new title, combat art and comic scenes. Listen to the music, enemy telegraphs and weapon contacts together on actual hardware.
4. **Difficulty and performance on the player’s hands.** Watch Makasçı, Galata footbridge, the Karaköy tram, the sack delivery and Ticket Man across several uncoached runs. Capture actual iPhone frame delivery, sound interruption, touch and save recovery before drawing any TestFlight conclusions.

## Verification notes

- The final fresh-save Chrome run cleared all 30 levels and unlocked Bölüm 31. Supporting Mac-layout play cleared Levels 11–30 in a separate run. Eight levels in the final fresh-save run used a revive. A separate results fixture clicked through an earned attribute upgrade, checked that it persisted on reload and verified that preview runs leave coins, clears and training unchanged. [R1 verification](REVIEW-R1.md)
- Route tests exercise the required checkpoint order, guard positions, train collision and removal, hold pause/resume, guide movement, boss windups and the second lane. The browser snapshots also show the prop placement that the sim tests cannot see.
- The Sirkeci balance batch cleared all five levels over eight seeds each with a maximum of one revive per run. It uses a fixed starting loadout and steering policy. The button and narrative sequence observations came from browser play, separately.
- The comic pass exercised every page the story renderer exposes, including pages after Bölüm 30 for portrait framing. The campaign audit and new content stop at Bölüm 30.
- [ImageGen provenance](../art/PROVENANCE.csv) documents the station props, service car and cast atlas. [Player flow captures](media/R1/slice-audit/player-flow.jpg) show title, movement, card, map, comic and reward screens.

### Fresh-save Chrome trace

Seed 42, Turkish, phone-size Chrome. The times are simulated seconds. A revive is the existing second chance. The driver used one if prompted. Remaining health is measured at Results. These are reproducibility figures for the observed campaign, with automated movement, card selection and attribute allocation.

| Bölüm | Time, s | Kills | Peak alive | Cards chosen | Chests | HP at clear | Revive |
|---|---:|---:|---:|---:|---:|---:|---|
| 1 | 122 | 220 | 63 | 5 | 1 | 74 | — |
| 2 | 163 | 424 | 44 | 5 | 7 | 100 | — |
| 3 | 179 | 476 | 55 | 6 | 3 | 93 | — |
| 4 | 184 | 477 | 59 | 5 | 2 | 96 | — |
| 5 | 142 | 189 | 67 | 3 | 4 | 40 | — |
| 6 | 113 | 399 | 72 | 4 | 2 | 102 | — |
| 7 | 158 | 520 | 93 | 5 | 3 | 112 | — |
| 8 | 205 | 690 | 104 | 6 | 3 | 106 | — |
| 9 | 230 | 861 | 79 | 8 | 3 | 112 | — |
| 10 | 138 | 275 | 88 | 4 | 4 | 69 | — |
| 11 | 125 | 320 | 45 | 5 | 2 | 111 | Yes |
| 12 | 116 | 319 | 54 | 5 | 2 | 35 | — |
| 13 | 187 | 470 | 54 | 8 | 3 | 33 | Yes |
| 14 | 184 | 415 | 43 | 6 | 2 | 39 | Yes |
| 15 | 147 | 311 | 44 | 6 | 4 | 115 | Yes |
| 16 | 106 | 271 | 40 | 5 | 2 | 64 | — |
| 17 | 108 | 314 | 72 | 5 | 2 | 70 | — |
| 18 | 142 | 347 | 104 | 5 | 2 | 109 | Yes |
| 19 | 135 | 345 | 51 | 7 | 2 | 83 | Yes |
| 20 | 144 | 304 | 68 | 5 | 2 | 118 | Yes |
| 21 | 81 | 222 | 77 | 4 | 2 | 114 | — |
| 22 | 86 | 242 | 85 | 5 | 2 | 91 | — |
| 23 | 167 | 438 | 107 | 9 | 3 | 86 | — |
| 24 | 122 | 333 | 74 | 6 | 2 | 114 | — |
| 25 | 140 | 289 | 58 | 6 | 4 | 98 | — |
| 26 | 117 | 268 | 58 | 6 | 2 | 53 | — |
| 27 | 90 | 237 | 77 | 4 | 3 | 124 | — |
| 28 | 158 | 369 | 69 | 7 | 6 | 124 | — |
| 29 | 146 | 390 | 39 | 9 | 3 | 115 | — |
| 30 | 111 | 233 | 73 | 5 | 2 | 111 | Yes |
