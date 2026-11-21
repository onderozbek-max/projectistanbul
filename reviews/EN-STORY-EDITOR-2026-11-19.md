# English story editor — 2026-11-19

## Scope and result

Reviewed the English opening, calls, comics and level pops in the three owned files, plus later authored Chapter 1 story/finale and the Chapters 2–3 outline. Revisions use American English and the shared beat facts, without translating Turkish dialogue. The requested comedy direction supersedes the older Shaun-style headline: use specific absurd reasoning, institutional habits and scared self-justification, while allowing plain speech and silence. No show lines, catchphrases or character impersonations were used.

Implemented **55 text-variant revisions**: 17 in core, 27 in story-levels and 11 in story-hoods-01-10. Existing beat keys, speaker assignments, page count and timings are unchanged. No Turkish, runtime, post-L30 production, balance or other files were changed by this editor. Revised lines lose stale ok approval. Genuine jokes carry j; the down pool still has two jokes in nine variants.

## What improved

1. **The family journey has a material purpose.** Mom leads with safety, explains the departure, then sends Arda for his scooter and Dad's map. Failed photo transfer explains collecting the paper. Arda repeats the actual plan before asking where to meet. L15 confirms the same destination, and L30 reveals Dad's highway trip before Arda reacts. English now carries D-121's established facts. The home arrival still needs to show the equipment pickup before future production.
2. **Answers respond to what was said.** Arda proposes a cab after Mom rules out the metro; she answers with gridlock. The jacket reply answers the question while exposing a familiar argument. His first lost call ends with him trying to be heard, rather than treating Mom's disappearance as a phone joke.
3. **Trust does not establish a medical fact.** Kaan says he believes Arda; fluent speech alone is not presented as proof against infection. Arda's bite answer no longer invents scratches on a potentially unhurt player. Before they have spoken, Arda recognizes a shared problem rather than claiming he already likes his armed accuser. The fish, boat plan, names and existing post-fight agreement remain.
4. **Comics carry a goal.** Galata's last caption connects the threatening hoist to the path toward Karaköy, instead of ending on a distance counter. The revised wedding artwork/text, visible Paşa and street-to-café-to-bridge staging are retained. Nuri's first-day memory, Arda's offer to wait and Kaan's refusal to stay are retained verbatim, including their earned variants.
5. **Character speech follows actual state.** The shopkeeper asks for protection while opening the shutter, rather than inviting entry at hold start. The first elite's line does not invent a door, captive or armor. Set-piece barks anticipate the Bloated Waiter, Spitter and Screamer because EK.set.start fires before spawning/attacking. The first-swing beat becomes Arda noticing his own reflex, not a magically self-operating knife.
6. **Action guidance stays human.** Removed an unsupported claim that acid cannot make someone slip, an instruction to go across a lit attack lane, the vague fishing phrase 'move across the cast' and a zombie 'catching his breath'. L13's midpoint refers to its actual tram crossing rather than a car blockage or still approaching a wedding already visited. Kaan's station instructions use his conversational voice and identify the attendant's role. American 'switch' replaces railway 'points' in the spoken line.
7. **Humor has a target and a context.** Examples: 'That one’s built for this. I dressed for dinner.'; 'One at a time. Being dead doesn’t get you priority.'; 'You picked a great night to win the jacket argument.' These aim at Arda's expectations or ordinary habits continuing during disaster. The down pool no longer renumbers the head rule as 'don't die' or ends in a heroic slogan. No increase in profanity was needed.

## Trigger checks that changed wording

- director.js first-elite trigger creates an elite walker. The elite flag raises combat values/size; it does not guarantee a door or a person in its hands. The new line observes the mismatch between this threat and Arda's ordinary dinner clothes.
- director.js startHold emits barkShop while the defense begins. The new line requests help until the shutter opens.
- events-kinds.js EK.set.start dispatches barkBloater, barkSpitter and barkScreamer before the telegraph completes. The old English texts prematurely reported a burst, spit or scream. Forecasting avoids certifying those actions. The corresponding Turkish core claims remain a separate observation; this editor's assigned scope keeps Turkish unchanged, and the root audit records the follow-up.
- H01i2a formerly listed runners/crawlers before their introduction. Its replacement observes fleeing civilians and pursuing dead. This stored hood intro is not dispatched in ordinary L1, which uses the cold open; the correction does not add an extra page.
- H03i3a formerly suggested automatic bloater-to-gas-tank chaining. Enemies.burst damages actors and creates toxic zones; Env.scan does not consume bloaterPop. The new caption treats the corner as dangerous without promising that causal mechanic.
- L13 uses tramPoints in config-levels.js. Its revised midpoint remains valid before or after the crossing clears. It does not assume a particular optional action was completed.

## Later draft: findings only

These are not current first-30 production changes and do not imply acceptance of the later campaign.

| Finding | Needed before later production |
|---|---|
| The English finale says to follow a marked route, but never stages the scooter/toolkit/map retrieval. | Pay off the L5 pickup motive visibly and establish charge/condition before the next trip. English FINb9 says 'road', not that all three will walk; the omitted pickup is the actual English issue. |
| Dad forbids highways, while Chapter 2 schedules D-100. | Show the unavoidable crossing or deliberate exception and its consequence. |
| Dad distrusts the forest refuge, yet the next family departure follows a broadcast about İzmir. | Explain why this specific information is credible or why necessity wins. Distrusting one destination does not logically prove all broadcasts false, but the present outline leaves the decision thin. |
| Working calls after L30 do not pursue what Dad saw. | Track what Arda asked, what Mom can answer and why the answer remains unavailable. Mystery should not require forgetting an urgent question. |
| H07p4 says 'Don't take your eyes off it' without a reliable immediate referent. H12p1 promises exactly six meters of flashlight reach. | Name the actual thing in the live scene; verify or remove fixed-range certainty against the finished encounter. |
| H20b asks Arda for forgiveness, and H20p1 immediately appraises Ahmet's bread basket as a shield. | Decide how much self-awareness transformed Ahmet has and protect a specific aftermath. The guilt wording is an intentionality/voice question, not automatically a plot contradiction. |
| Some later entrances introduce scenery but not why the party takes that route. | Connect detours to a blockage, resource, person or choice. Validate concrete geography such as the bakery turn against future playable staging. |
| The outline selects Kaan's attraction from the player's highest bond; Ada stays with Arda long before identifying Dad. | Seed independent motives for Kaan/Mila/Ada and audit exactly when Ada sees or hears identifying information. Do not rely on the meter or prolonged silence to manufacture drama. |

The current English Mila exchange is coherent: Arda tells her where his family is before they agree to travel together. Kaan's grandmother is explicitly with cousins before the garage rest. These do not need another rewrite.

## Validation and limits

Final `node prototype/tools/test-dialogue.js` passed after all 55 revisions: 583 shared beats, 1,202 TR / 1,205 EN variants and identical seeded language digest `12d2b67db8`. The run reports zero over-limit lines, zero off-ratio pools and zero duplicates; the same one non-strict translationese/Britishism note remains in the shared store. `git diff --check` passes for the owned files. The root agent owns integrated verification. No runtime, full campaign, artwork or listening acceptance is claimed by this editor. No lint result can establish laughter, attachment or zero logical flaws.

Baseline: /tmp/istanbul-en-endtoend-before-20261119/prototype/js/dialogue/en. The following table records every text change from that supplied snapshot. Metadata accompanying changed text is recorded in the source; none of these new drafts is marked owner-approved.

## Complete before/after table

| Key / variant | Placement | Before | After |
|---|---|---|---|
| `barkAttack` | L1 director / set-piece bark | Wait, the damn knife's cutting on its own? I'm not even doing anything! | Okay. My arm figured this out before I did. |
| `barkBloater` | L1 director / set-piece bark | A Bloated Waiter just burst out of the shop. I didn't order that. | Bloated Waiter! Give that doorway some room! |
| `barkElite` | L1 director / set-piece bark | That huge one's carrying something. A door? Or a man? Hope it's a door. | That one's built for this. I dressed for dinner. |
| `barkHack` | L1 director / set-piece bark | A signal box! I can link into it. Let's see if it likes me. | A signal box. Maybe I can get Mom back. |
| `barkLoot` | L1 director / set-piece bark | That runner has a tray of simit. Mine now. | That runner's got a tray of simit. I need that food. |
| `barkRunners` | L1 director / set-piece bark | Are they running? Running's my thing. Get your own! | They're running. That was supposed to be my advantage. |
| `barkScreamer` | L1 director / set-piece bark | It screamed. Now the whole block is coming. | Screamer. If it starts, the whole block comes running. |
| `barkShop` | L1 director / set-piece bark | Hang on, kid. Shutter's stuck. Duck under and get in here! | Stay close, kid. Keep them back while I get this open. |
| `barkSpitter` | L1 director / set-piece bark | Balcony guy just spat at me. That's not very neighborly. | Spitter on the balcony. Keep moving. |
| `callA1` | L1 phone conversation | Mom? Can you hear me? One bar. Please let it be you. | Mom? It's me. Are you there? |
| `callB2` | L1 phone conversation | Taxi? Great. The driver's probably a zombie too. | Then I'll find a cab. There has to be one still moving. |
| `callB4` | L1 phone conversation | I'm wearing the hoodie you bought me. One size too big. Extra insulation. | It's on, Mom. You picked a great night to win the jacket argument. |
| `exit2` | L1 shelter comic | Mom? ...Mom! Even the phone gave up before I did. | Mom? Mom, I'm still here. Can you hear me? |
| `rule3` | L1 cold open | Rule three... what was rule three? Oh, right. Don't stop. | Rule three: keep moving. Come on, Arda. |
| `down.arda#2` | Down screen · Arda | Dead, and my dürüm is still half-eaten. Unacceptable. | I left half a dürüm. That's going to bother me. |
| `down.arda#6` | Down screen · Arda | Rule one: don't die. Noted. Very helpful, rule one. | Next time, panic in a useful direction. |
| `down.arda#9` | Down screen · Arda | It's not over until we say it's over. We haven't. | Get up. She'll call again. You need to answer. |
| `K20e` | L20 Kaan introduction comic | Let me check the boat in Eminönü. My captain's there. Then I'll walk you home. | My captain's boat is in Eminönü. Let me check on him. Then I'll walk you home. |
| `C05a` | L5 opening call | Arda? There you are. We've left the apartment, sweetheart. | We're safe, sweetheart. We had to leave the apartment. |
| `C05b` | L5 opening call | I'm here. Are you safe? Where did you go? | Wait. Where are you? I've been trying to get home. |
| `C05c` | L5 opening call | Go home first. Your dad put the safe streets on a map for you. It's on the kitchen table. | Get your scooter from home. Dad left a map there; I can't get the photo to send. |
| `C05d` | L5 opening call | I'll get it. Where am I meeting you? | Okay. Scooter, map, then you. Tell me where. |
| `C15a` | L15 opening call | Arda? We made it to Grandpa's. Where are you now? | Still at Grandpa's, honey. Your turn. Where are you? |
| `C15c` | L15 opening call | Yes, Sarıyer. Follow Dad's map when you get home. There's food in the fridge. | Yes, Sarıyer. Take Dad's map with you. And eat something before you leave home. |
| `C15d` | L15 opening call | Food in the fridge. See, Mom? I do listen. | I heard 'map.' I also heard 'food.' I'm deciding on the order. |
| `C30c` | L30 post-fight call | Find Dad's note in the kitchen. He marked the roads you can still take. | Your dad came back from the highway. His notes are with the map in the kitchen. |
| `C30d` | L30 post-fight call | Which roads? What happened out there? | He went out there? Mom, what happened? |
| `C30e` | L30 post-fight call | Stay off the highway. Your dad saw what was on it. It was [static] | He told me to keep you off that road. There was something [static] |
| `E5c` | L5 closing comic · thought | Sarıyer. Kitchen first. Dad's note might tell me how to get there. | Home for the scooter. Dad's map for the roads. Then I get to see them. |
| `K20b` | L20 Kaan introduction comic | All right. You're talking, you're not biting. I'm Kaan. I worked on the boats in Eminönü. | Okay. I believe you. I'm Kaan. I work on one of the boats in Eminönü. |
| `L01m` | L1 midpoint pop | Rule three, got it. My feet were already on it. | That shutter's my way out. Keep moving. |
| `L01s` | L1 entry pop | Head first, then don't get bitten. Doing both at once is the hard part. | Go for the head. Keep clear of the teeth. Okay. I can remember two things. |
| `L02s` | L2 entry pop | Still no signal. Zero bars, and my mood matches. One more try. | No signal. I'll try again farther down the street. |
| `L04m` | L4 midpoint pop | Cut the wire, don't step on it. I skipped physics. | Cut the wire. Do not become part of the circuit. |
| `L05m` | L5 midpoint pop | The Vatman rings before he hits. If the rails light up, get across them. | Bell means he's about to hit. Get off those glowing rails. |
| `L07m` | L7 midpoint pop | Acid puddles. You won't slip in them, but you'll slow down. | Acid on the steps. Keep my shoes out of it. |
| `L09m` | L9 midpoint pop | Hold the step, let them come in turns. Like the morning metro, but less shoving. | One at a time. Being dead doesn't get you priority. |
| `L10m` | L10 midpoint pop | Dodge the weights and step across his charge. Hit when he stops to catch his breath. | I can hit him when he stops. First, get clear of those weights. |
| `L11s` | L11 entry pop | Heading down to Karaköy. The slope's steep, my knee objects. So do I. | Made it to Karaköy. My knees would like a written apology. |
| `L13m` | L13 midpoint pop | The music's louder here. We're close to the wedding. | Keep clear of the tracks. I still have a long way to walk. |
| `L13s` | L13 entry pop | Horns. A wedding convoy must be coming. Do they throw flowers at zombies? | Wedding music. Still going. The playlist has handled this better than I have. |
| `L18m` | L18 immediate reply at entry | No bites! Just scratches. And a very bad night. | No bites! I'm scared, I'm hungry, and that fish isn't helping! |
| `L19m` | L19 midpoint pop | The guy's still watching me. I don't know who he is. | He hasn't run off. If we get through this, I'm getting his name. |
| `L20m` | L20 midpoint pop | Move across the cast. If his hook comes back empty, get a hit in before he reels again. | Sidestep the hook. While he's reeling it back, I can get close. |
| `H01i2a` | Stored İstiklal intro (not dispatched in normal L1) | Walkers, runners, crawlers along the curb. No clear way through. | People are fleeing down the street. The dead are following. |
| `H02i3b` | L6 hood intro · panel 3 | Galata. 1.8 km done. | The way down to Karaköy runs right past that hoist. |
| `H03i3a` | L11 hood intro · panel 3 | Bloaters by the gas tanks. One pops, and it's a chain reaction. | Bloaters crowded around gas tanks. I'm giving that whole corner a wide berth. |
| `H04i3a` | L16 hood intro · panel 3 | Someone out there is fighting zombies with a fish. I like him already. | He's swinging at them. Okay. Same problem. Different equipment. |
| `H04i3b` | L16 hood intro · panel 3 | Fishing lines are tangling my feet. | Fishing line everywhere. I can't reach him from this side. |
| `H05b` | L25 boss pop | Mind the anchor, lads! | Watch the anchor, crew! |
| `H05p3` | L23 entry pop | Three sacks. I'll clear a path. Don't breathe in when they split. | Three sacks between us and the boat. Watch the dust when we break them. |
| `H06i2a` | L26 hood intro · panel 2 | Crews don't use the turnstiles. Find an attendant and we're through. | There'll be a staff entrance, abi. Let's find someone who knows where. |
| `H06p2` | L27 entry pop | Let the attendant take point, Arda. They've got the keys. | That attendant's got keys. Let's get them to the door, abi. |
| `H06p5` | L30 entry pop | The points are set against us. I'll throw the lever. Watch the rails. | Wrong track. I'll work the switch. Keep an eye on the rails. |
| `H06m5` | L30 midpoint pop | Clear the marked tracks. When he drops his guard after the punch, go in. | Off those rails, abi! Let him miss, then hit him. |
