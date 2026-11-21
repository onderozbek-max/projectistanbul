# English world and district bark audit — 2026-11-19

## Scope and result

Reviewed **468 English variants across 152 pools**: every shared world-event bark, every H01–H10 district pool, and all H11–H20 district pools. Implemented **142 text revisions and 2 metadata-only corrections** (105 world entries; 39 first-30 district entries).

Production ownership is limited to `prototype/js/dialogue/en/barks-world.js` and H01–H06 in `barks-hoods-01-10.js`. H07–H20 were read as later drafts and left unchanged. No Turkish, simulation, scheduler, runtime, artwork, audio, keys or pool lengths changed. The baseline is `/tmp/istanbul-en-endtoend-before-20261119/prototype/js/dialogue/en`, not Git HEAD, which includes earlier unrelated work.

The English was written from event facts and the character's intent. Arda remains an anxious Istanbul student using original American English: practical fear first, occasional satire about work, customer service, his education and his own attempted competence. The owner references guide the broad comedy direction; no show quotation, copied character voice or imported science-fiction premise is used. Effective existing lines were retained. The wedding absence, approaching Kaan's captain and generic objective failure are allowed to stay serious.

Examples of the revised direction:

- A guarded supply chest: “Even the emergency supplies have a bouncer.”
- A civilian crowd has passed: “Everyone shoving past. Almost feels like a normal commute.”
- Activating tram controls: “Tram controls. My scooter has fewer buttons.”
- Sirkeci arrival: “The trains stopped. The ticket checks survived.”

The scooter comparison also removes a claim that Arda has no driver's license; the script does not need to invent that background detail while establishing his scooter as the onward transport. “Signal's back” now opens the possibility of reaching Mom; it no longer invents her answer, twelve notifications or exactly two bars.

## Trigger evidence and corrections

| Source | What the code establishes | Consequence for the English |
| --- | --- | --- |
| `prototype/js/story/barks.js` (`H.eventStart`, `H.eventEnd`) | Starts and ends are separate. Ambush/pier/chest/rescue/hazard end pools are suppressed because an end can mean enemies spawned or a chest dropped. Failed/capped/skipped ends are also suppressed. | Pier's dormant end pool no longer invents a departed ferry, clear pier or witnessing captain; no runtime enablement. Other dormant drafts still need review before enabling. Active defend/loot endings must work for success **and** expiration/escape. |
| `prototype/js/sim/events-kinds.js` (`hordeKind`) | Ambush and pier emit a telegraphed side horde, not a ferry arrival/departure. | Pier starts describe the approaching crowd and room to retreat. No invented ferry service. |
| `events-kinds.js` (`EK.barricade`) | Furniture obstructs the route and is removed when the barricade is smashed. | Starts seek passage instead of praising friendly protection. Ends acknowledge the actual destroyed obstacle. |
| `events-kinds.js` (`EK.stampede`) | Fleeing civilians cross the street and push nearby actors. | Identify people escaping; make room rather than implying a zombie pursuit. Ends do not tell Arda all danger is over or his legs can stop. |
| `events-kinds.js` (`EK.chest`, `EK.defend`, `EK.loot`) | A guard protects the chest; defend requires remaining within an area, not standing still; the loot runner carries a simit tray and may escape. | Chest lines mention the guard. Defend permits moving inside the area. Existing outcome-neutral chase endings stay intact. |
| `prototype/js/sim/env-kinds.js` (`spray`, `chainAt`) | Foam can be discharged with zero extinguished fires; chains can involve cars as well as gas canisters. | Describe foam/slow ground without asserting a fire went out. Remove “every piece is a propane tank” and exact tank assumptions. |
| `prototype/js/sim/env-zones.js` (`zap`) | A shock event can occur with `hero: false`. | No tingling-foot/hit claim; warn about live water instead. |
| `prototype/js/sim/env-portal.js` (`spillPortal`) and `prototype/js/view/env-fx.js` (`BARK`) | The shared door pool follows both door and window portal activity; it is not an advance door-shaking cue. | Keep clear of entrances/openings instead of choosing the wrong portal or speaking before its opening. No instruction to avoid looking at a newly revealed threat. |
| `prototype/js/config-env.js` (`fuse`) | Fuse lengths differ by source; none guarantees the two seconds asserted in the old bark. | Retain urgency without inventing a precise timer. |
| `prototype/js/sim/hack.js` (`step`, `fail`, `OUTCOMES`) | Failure emits `reason: left` after the active link is lost; selection can also switch terminals inside overlapping radii. It does not prove a jam, lockout, wrong PIN or red traffic light. Traffic success emits a stun pulse without proving a target was present. Shutters can yield a cache without removing a block. | Failures acknowledge the interrupted attempt without necessarily claiming Arda moved too far. Success reports the pulse/cache, then asks Arda to check the situation. It never guarantees a newly safe road. |
| `hack.js` (`armCrossing`, `advanceTram`) | Successful tram activation can precede movement by an authored warning/gather interval. | Control is set / tram is on its way, rather than “moving now.” |
| `hack.js` (`OUTCOMES.cell`) and `story/barks.js` (`signalRestored`, `signalLost`) | Service state and phone-call state are different facts. | No automatic answered call, notification count, fixed bars or assumption Mom was speaking when service dropped. |
| `story/barks.js` (`onLevel`) | Hood barks are offered on entry: 1.5 s delay for stage 1, 3 s otherwise; H01.1 is not normally queued. | Avoid declaring a boss attack or a struck target at level entry. Captain approach remains uncertain and supportive. |

Shared environmental barks have the existing 8 m proximity check; source-bound combat warning checks and quiet-scene protection remain untouched. A text audit cannot certify every camera/occlusion state. Do not infer visibility from a stored bark alone.

## Shared artwork consistency

Visually inspected `prototype/assets/comic/scenes-a-story-v2.webp`. Its café tile shows wedding ribbons, abandoned place settings and a partly cut cake inside the room. The previous `BK.hd03.1` pool referred to a closed café, cakes in the window and an espresso machine hissing. The revised variants describe the interrupted wedding and absent guests, matching the current image and the shared Galata → wedding → Paşa sequence. The new scenery, Paşa insert and listening portraits were not modified. This was source-image inspection, not a new rendered-page or phone acceptance pass.

## Later-only findings — no production edits

| Pool / level | Finding | Required action before that content ships |
| --- | --- | --- |
| `BK.hd11.4#1`, L54 | Kaan keeps looking away from “the sign,” without identifying the sign or why it matters. | Stage and name the sign before treating avoidance as a character clue. |
| `BK.hd12.3#0–1`, L58 | Two variants give opposite states for the same gate: opening versus already closed. | Choose the actual gate state or bind the variants to separate events. |
| `BK.hd12.5`, L60 | Departure hopes imply a functioning train escape without an established payoff. | Establish the possibility before raising it, or clearly frame Arda as still waiting at a dead service. |
| `BK.hd14.2`, L67 | Garden/tea-garden language conflicts with D060's underground Zindanlar direction. | Rewrite after the dungeon route and props are finalized. |
| `BK.hd14.3#2`, L68 | “The keys are on him” assumes an identified carrier; the other variants are still searching. | Identify the carrier in a preceding beat or preserve uncertainty. |
| `BK.hd16.2`, L77 | Hay-bale references conflict with D060's shore-pier scene. | Match the built route rather than preserving retired scenery. |
| `BK.hd17.5#1–2`, L85 | Prior visits to this principal's office imply this is Arda's own school, which has not been established. | Establish that history or remove the implied personal memory. |
| `BK.hd19.3#0–1`, L93 | A zombie has just fallen / is halfway across, but this is a level-entry pool, not an action event. | Trigger from the actual action or rewrite as an observation that is already staged. |
| `BK.hd19.4`, L94 | Ropes have already trapped zombies when the entry bark is offered. | Ensure the trapped state exists before the bark or make it a prospective plan. |
| `BK.hd20.4#2`, L99 | Searching for a key may contradict Arda confirming he has the apartment key in C50. | Specify a different gate key if that is intended, otherwise remove the duplicate obstacle. |
| H07–H20 entry pools generally | Some entries assert fallen stock, opened gates, raised weapons or exact positions before corresponding actions are guaranteed. | Check final staging and bind action-dependent lines to the real event. Stored prose is not sufficient proof of a visible beat. |

These are draft risks, not claims that unbuilt later chapters currently fail in play. Ahmet's later personal memories should retain their space without an added gag.

## Verification

Snapshot/VM verification passes: the same keys and pool lengths; every changed line at most 60 characters; no carried approval on changed entries; H07–H20 unchanged. The largest edited line is 58 characters. The integrating agent owns the complete dialogue/bark/scene regression run; this report does not claim a full-suite, device, audio-listening or laughter/retention test.

`git diff --check` is clean for the two owned production files and this report. Source-image review and code inspection are distinguished above from runtime acceptance.

## Exact change inventory

Indices are zero-based within each pool. `J` means the scheduler's joke tag. The rows use the supplied pre-pass snapshot, not Git HEAD. Dormant event-end rows remain undelivered.

| Pool / variant | Actual placement | Before | After | Joke metadata |
| --- | --- | --- | --- | --- |
| `BK.boss.phase#2` | bossPhase | Round two. Nobody tells you about round two. | It has more stages than my degree. | J → J |
| `BK.env.break#3` | Nearby environment → break | Something broke. I'll leave an apology if I survive. | Something broke. Put it on the apocalypse's tab. | J → J |
| `BK.env.chain#2` | Nearby environment → chain | Dominoes, but every piece is a propane tank. | Great. The explosions are making friends. | J → J |
| `BK.env.chain#3` | Nearby environment → chain | How many of these tanks are on this street? | Back up. The next one could go too. | plain → plain |
| `BK.env.door#0` | Nearby environment → door | A door's opening. Get ready. Get ready. | Keep clear of that entrance. Leave room to move. | plain → plain |
| `BK.env.door#1` | Nearby environment → door | Someone's at the window. Don't look at them. | Watch that opening. Don't get caught beside it. | plain → plain |
| `BK.env.door#2` | Nearby environment → door | That door is shaking. Back off slowly. | Keep back from the building. Check the windows too. | plain → plain |
| `BK.env.door#3` | Nearby environment → door | This building never liked me. Now it's proving it. | Watch the entrances. They don't knock first. | J → J |
| `BK.env.explode#0` | Nearby environment → explode | Down! Get down! Get down! | Get clear of the blast site! Watch for another! | plain → plain |
| `BK.env.explode#3` | Nearby environment → explode | Who parks next to a gas canister? Who? | Stay away from anything still burning. | plain → plain |
| `BK.env.extinguish#0` | Nearby environment → extinguish | Out. Give me a second to breathe. | Foam's down. Let them struggle through it. | plain → plain |
| `BK.env.extinguish#1` | Nearby environment → extinguish | Foam on the fire. Good. Keep it coming. | Foam on the ground. Watch where it spreads. | plain → plain |
| `BK.env.fuse#2` | Nearby environment → fuse | Two seconds. Longest math problem of my life. | That's a very short fuse. I can relate. | J → J |
| `BK.env.shock#0` | Nearby environment → shock | Live wire! Out of the water. Out, out! | Live wire! Stay out of that water! | plain → plain |
| `BK.env.shock#1` | Nearby environment → shock | My feet are tingling. Not the good kind. | The puddle's live. Take the dry way around. | plain → plain |
| `BK.env.shock#3` | Nearby environment → shock | Don't stand in the puddle. Don't. Don't. | Don't step in that puddle. Keep your distance. | plain → plain |
| `BK.ev.ambush#0` | eventStart → ambush | Ambush! To the wall. No, wait, check the wall first. | From the side! Leave myself room to move. | plain → plain |
| `BK.ev.ambush#1` | eventStart → ambush | Ambush. Somebody planned this. Zombies don't plan. | An ambush. Even the shortcuts want a piece of me. | J → J |
| `BK.ev.ambush#2` | eventStart → ambush | Ambush from the side! Backs to the wall, eyes up. | Side street! Don't let them cut off the path. | plain → plain |
| `BK.ev.barricade#0` | eventStart → barricade | A barricade. Someone did good work. Respect. | Tables blocking the road. I need a way through. | plain → plain |
| `BK.ev.barricade#1` | eventStart → barricade | Tables and chairs stacked tight. A homemade castle. | That barricade blocks the street. Find a weak spot. | plain → plain |
| `BK.ev.barricade#2` | eventStart → barricade | Whoever built this, you're my hero. Don't tell Dad. | Barricade. Made of things I'd rather be sitting on. | J → J |
| `BK.ev.blackout#0` | eventStart → blackout | Power's out. My phone was already a very expensive brick. | Power's out. Now I have to imagine the teeth. | J → J |
| `BK.ev.blackout#1` | eventStart → blackout | Pitch dark. Where's my flashlight? | Lights out. Keep a gap around me. | plain → plain |
| `BK.ev.burningCar#0` | eventStart → burningCar | The car's on fire. Nobody's inside, right? Right? | That car's burning. Don't get close! | plain → plain |
| `BK.ev.burningCar#1` | eventStart → burningCar | Burning car. Go around slow. Don't stand behind it. | Burning car. Give it room before it blows. | plain → plain |
| `BK.ev.burningCar#2` | eventStart → burningCar | Somebody's having a worse day than me. Probably. | Car's on fire. I'll take the scenic route around it. | J → J |
| `BK.ev.chest#0` | eventStart → chest | A chest! Somebody's stash, and now it's mine. | A supply chest. Something's guarding it. | plain → plain |
| `BK.ev.chest#1` | eventStart → chest | Supply chest in the middle of the street. Grab it fast. | Guarded chest ahead. Clear the guard first. | plain → plain |
| `BK.ev.chest#2` | eventStart → chest | Chest in the middle of the street. Very subtle. | Even the emergency supplies have a bouncer. | J → J |
| `BK.ev.defend#0` | eventStart → defend | Hold the spot. Nobody moves. Including me. | Stay in the area. Keep moving inside it. | plain → plain |
| `BK.ev.defend#2` | eventStart → defend | Hold the line. Nobody goes anywhere. | Hold this patch of ground. Don't get boxed in. | plain → plain |
| `BK.ev.pier#0` | eventStart → pier | The ferry's in. Everybody off the pier, now. | Pier's filling up. Keep the way back open. | plain → plain |
| `BK.ev.pier#1` | eventStart → pier | Ferry's here, and they're coming straight at me. | Here they come from the pier. Don't get cornered. | plain → plain |
| `BK.ev.pier#2` | eventStart → pier | Ferry's in. Nobody told them there's a line for boarding. | The pier's crowded. Somehow the view got worse. | J → J |
| `BK.ev.stampede#0` | eventStart → stampede | Stampede! Run, run, run! | People running through! Stay out of their way. | plain → plain |
| `BK.ev.stampede#1` | eventStart → stampede | Everybody's running. Guess this is a marathon now. | Fleeing civilians. Good. Humans. Bad time to mingle. | J → J |
| `BK.ev.stampede#2` | eventStart → stampede | Here they come. Move to the wall. Move! | They're running across the street. Give them room. | plain → plain |
| `BK.evend.barricade#0` | eventEnd → barricade | Time to leave the barricade. Look for a clear path. | Barricade's down. Check the path before moving. | plain → plain |
| `BK.evend.barricade#1` | eventEnd → barricade | I'd thank the furniture, but we're in a hurry. | I just fought furniture. College did not cover this. | J → J |
| `BK.evend.blackout#0` | eventEnd → blackout | Lights are back. We all blinked, right? | Lights are back. Check what moved while they were out. | plain → plain |
| `BK.evend.blackout#2` | eventEnd → blackout | Lights are on. Okay. Everybody still has a face. | Lights are on. That doesn't mean it's safe. | plain → plain |
| `BK.evend.defend#0` | eventEnd → defend | Time's up. Find a way out of here. | Done holding this spot. I need a way out. | plain → plain |
| `BK.evend.pier#0` | eventEnd → pier | Ferry's gone. Back to the street, quietly. | Keep clear of the pier crowd. Leave myself a way out. | plain → plain |
| `BK.evend.pier#1` | eventEnd → pier | The pier is quiet again. For now. | I need a way home. Waiting on this pier won't help. | plain → plain |
| `BK.evend.pier#2` | eventEnd → pier | Ferry's gone. The captain saw everything. Didn't even wave. | Pier's getting crowded. Great view, terrible company. | J → J |
| `BK.evend.stampede#0` | eventEnd → stampede | The herd passed. Okay. Pulling myself together. | The people got past. Check what's behind them. | plain → plain |
| `BK.evend.stampede#1` | eventEnd → stampede | Run's over. My legs haven't gotten the news yet. | Everyone shoving past. Almost feels like a normal commute. | J → J |
| `BK.evend.stampede#2` | eventEnd → stampede | It's over. Legs, you can stop now. | People are clear. Keep moving, Arda. | plain → plain |
| `BK.hack.alarm.done#1` | hackDone → alarm | They're turning toward the car. Now's my chance. | Alarm's on. Now get some distance from the car. | plain → plain |
| `BK.hack.alarm.fail#0` | hackFail → alarm | Couldn't trigger it. They're still looking at me. | Lost the connection. The alarm didn't start. | plain → plain |
| `BK.hack.alarm.fail#1` | hackFail → alarm | Now the car decides to be considerate. Great. | Lost the link. Couldn't even make a car obnoxious. | J → J |
| `BK.hack.alarm.fail#2` | hackFail → alarm | Alarm won't start. Need another way around. | Alarm's still off. Try again when there's room. | plain → plain |
| `BK.hack.atm.done#0` | hackDone → atm | Got it open. Grab what I can and keep moving. | Cash is out. Grab it before I get crowded. | plain → plain |
| `BK.hack.atm.done#1` | hackDone → atm | The lock gave way. Let's see what we've got. | The ATM paid out. Keep an eye on the street. | plain → plain |
| `BK.hack.atm.done#2` | hackDone → atm | It opened. Best customer service I've had all night. | It paid out. Better service after civilization collapsed. | J → J |
| `BK.hack.atm.fail#0` | hackFail → atm | Locked me out. Damn it. | Lost the connection. Nothing paid out. | plain → plain |
| `BK.hack.atm.fail#1` | hackFail → atm | Locked out. Fine. I'll remember that for next time. | I lost the link. I'll have to try again. | plain → plain |
| `BK.hack.atm.fail#2` | hackFail → atm | ATM's locked. I'll write the bank a strongly worded letter. | The ATM needs my attention. So does the biting. | J → J |
| `BK.hack.atm.start#1` | hackStart → atm | First PIN guess: Mom's birthday. Sorry, Mom. In advance. | Come on. One withdrawal without a life lesson. | J → J |
| `BK.hack.atm.start#2` | hackStart → atm | Trying 1234. Yes, I know. Don't judge me. | Keep the link steady. Watch the street. | plain → plain |
| `BK.hack.booster.done#1` | hackDone → booster | Got a signal. Now I can call home. | Signal's back. Let's see if I can reach Mom. | plain → plain |
| `BK.hack.booster.fail#0` | hackFail → booster | No connection. The signal box won't respond. | Lost the link. The booster isn't ready yet. | plain → plain |
| `BK.hack.booster.fail#1` | hackFail → booster | Still no service. Even the box is ignoring me. | Lost the link. I fixed absolutely nothing. | J → J |
| `BK.hack.booster.fail#2` | hackFail → booster | Didn't work. I'll have to find another signal. | Lost the link. Need to finish that connection. | plain → plain |
| `BK.hack.booster.start#2` | hackStart → booster | If this works, I can get a call through. | If this works, I can try Mom again. | plain → plain |
| `BK.hack.shutter.done#0` | hackDone → shutter | Shutter's up. Check what's behind it. | There's the stash. Check it before moving on. | plain → plain |
| `BK.hack.shutter.done#1` | hackDone → shutter | It opened. Finally, a door with some manners. | It worked. I can stop negotiating with a shutter. | J → J |
| `BK.hack.shutter.done#2` | hackDone → shutter | Up it goes. Look inside before moving. | Supply box released. Grab it if there's room. | plain → plain |
| `BK.hack.shutter.fail#0` | hackFail → shutter | Shutter's stuck. Shit. Not now, please. | Lost the link. I wasn't done with that shutter. | plain → plain |
| `BK.hack.shutter.fail#1` | hackFail → shutter | Stubborn shutter, stubborn me. Neither of us is moving. | Lost the link. I hate unfinished arguments. | J → J |
| `BK.hack.shutter.fail#2` | hackFail → shutter | Jammed. The owner would say I skipped maintenance. Fair. | Too far from the controls. I'll need another try. | plain → plain |
| `BK.hack.shutter.start#1` | hackStart → shutter | This shutter's louder than a zombie. Somebody oil it. | A locked shutter. Because the zombies weren't enough. | J → J |
| `BK.hack.shutter.start#2` | hackStart → shutter | Right, shutter. Up you come. Quietly. | Come on, shutter. Let me finish this. | plain → plain |
| `BK.hack.traffic.done#0` | hackDone → traffic | They're stunned. Move before they recover. | Pulse sent. Check for a gap before moving. | plain → plain |
| `BK.hack.traffic.done#1` | hackDone → traffic | That stopped them. Get through the gap. | That pulse can stun them. Check who's still moving. | plain → plain |
| `BK.hack.traffic.done#2` | hackDone → traffic | Traffic finally stopped for me. Took an apocalypse. | I hacked a crossing. Walking is getting complicated. | J → J |
| `BK.hack.traffic.fail#0` | hackFail → traffic | It didn't work. Find another way across. | Connection lost. Still need a way through. | plain → plain |
| `BK.hack.traffic.fail#1` | hackFail → traffic | Still red. Just like every morning. Istanbul, forever. | Lost the link. Even traffic lights need commitment. | J → J |
| `BK.hack.traffic.fail#2` | hackFail → traffic | The lights won't listen. Right, plan B. | Didn't finish. Get closer to the control box. | plain → plain |
| `BK.hack.tram.done#0` | hackDone → tram | Tram's moving. Don't tell the Vatman. | Tram control's set. Clear the rails. | plain → plain |
| `BK.hack.tram.done#1` | hackDone → tram | Tram's moving. Stay clear of the tracks. | The tram's on its way. Stay off the tracks. | plain → plain |
| `BK.hack.tram.done#2` | hackDone → tram | Tram's moving. Nobody checks tickets. I'm a model citizen. | I can call a tram. Still can't get a ride home. | J → J |
| `BK.hack.tram.fail#0` | hackFail → tram | The tram won't budge. Even the rails are tired of me. | Lost the link. The tram has declined my leadership. | J → J |
| `BK.hack.tram.fail#1` | hackFail → tram | No key, no ticket, but plenty of hope. | Not connected. Need another try at the controls. | plain → plain |
| `BK.hack.tram.fail#2` | hackFail → tram | Not moving. The tram isn't either. Great. | Too far from the box. The tram isn't ready. | plain → plain |
| `BK.hack.tram.start#0` | hackStart → tram | Starting a tram. I don't even have a driver's license. | Tram controls. My scooter has fewer buttons. | J → J |
| `BK.hack.tram.start#1` | hackStart → tram | Looking at the Vatman's cab. Here goes. | At the tram controls. Let's get it moving. | plain → plain |
| `BK.hack.tram.start#2` | hackStart → tram | Right, tram. I've seen this in movies. How hard can it be? | Come on, tram. One clear run down these tracks. | plain → plain |
| `BK.obj.done#1` | objDone | Got it, quick and clean. | Finished. Still need to watch the way out. | plain → plain |
| `BK.obj.done#2` | objDone | Side job done. Nobody clapped, so I clapped for me. | Job done. I accept payment in fewer problems. | J → J |
| `BK.obj.fail#1` | objFail | Lost it. Next time, faster. | Didn't work out. Keep a way forward. | plain → plain |
| `BK.obj.fail#2` | objFail | Gone, and the bonus with it. I'll sulk later. | I can't fix that now. I can keep going. | J → plain |
| `BK.obj.start#1` | objStart | Bonus on offer if I pull this off. Worth a look. | There's something here worth taking a chance on. | plain → plain |
| `BK.obj.start#2` | objStart | Extra task. Nobody asked, but it pays. Maybe. | One more job. My walk home needs a project manager. | J → J |
| `BK.rescue#2` | rescueDone | Rescued. Don't thank me yet. Run. | You're free. Don't wait around to thank me. | plain → plain |
| `BK.rescue#3` | rescueDone | One more life. Today's going well. | One person out. Keep that gap open. | plain → plain |
| `BK.rescue#5` | rescueDone | I helped. Now I want a simit. | There's a way out. Take it while you can. | plain → plain |
| `BK.sig.back#0` | signalRestored | Signal's back! Mom, can you hear me? | Signal! I can try Mom again. | plain → plain |
| `BK.sig.back#1` | signalRestored | Signal! Mom first. Then everybody else. | Service is back. Come on, let the call go through. | plain → plain |
| `BK.sig.back#2` | signalRestored | Signal's back. My phone buzzed twelve times at once. | There's a signal. Check the phone before it drops. | plain → plain |
| `BK.sig.back#3` | signalRestored | Two bars. A miracle. A very stingy one, but a miracle. | Signal's back. The phone has rejoined the group project. | J → J |
| `BK.sig.lost#0` | signalLost | Signal's gone. Just me and the roads. | Signal's gone. Keep the phone handy. | plain → plain |
| `BK.sig.lost#2` | signalLost | Signal dropped. Mom's waiting on the other end. | Lost the signal. No way to check on Mom yet. | plain → plain |
| `BK.sig.lost#3` | signalLost | Zero bars. Nothing to do but keep walking. | Signal dropped. Keep moving until it comes back. | plain → plain |
| `BK.hd01.2#2` | L2 entry | Dusk is turning to night. Keep a wall at my back. | Night's closing in. Keep a way out on both sides. | plain → plain |
| `BK.hd01.4#1` | L4 entry | Wet rails, zombies in the drizzle. Lovely. | Live wires and rain. The street wants a turn too. | J → J |
| `BK.hd02.1#0` | L6 entry | Galata's stairs. My legs have opinions about these. | Galata's stairs. My legs have opinions about these. | plain → J |
| `BK.hd02.1#1` | L6 entry | Cobbled steps, lanterns coming on. Hold the rail. | Wet steps. Keep away from the edge. | plain → plain |
| `BK.hd02.1#2` | L6 entry | Every one of these stairs is steeper than the last. | Down these steps. Slowly. The street isn't going anywhere. | plain → plain |
| `BK.hd02.2#0` | L7 entry | Backgammon board left open. One piece still on the dice. | Backgammon left mid-game. Nobody collected the pieces. | plain → plain |
| `BK.hd02.2#1` | L7 entry | A saz on a radio somewhere. Nobody's dancing. | Music carries between the buildings. So do the screams. | plain → plain |
| `BK.hd02.2#2` | L7 entry | Tables still set. Nobody came back for their drinks. | Full tea glasses. They left in a hurry. | J → plain |
| `BK.hd02.3#0` | L8 entry | There’s a bell behind them. Loud enough to make them turn? | There's a bell here. Maybe I can draw them away. | plain → plain |
| `BK.hd02.3#2` | L8 entry | They’re looking downhill. Get them to turn around. | Use the bell, then move while they're distracted. | plain → plain |
| `BK.hd02.4#1` | L9 entry | Lanterns swinging, a horde coming down. Nice view. | Of course they're coming down. Gravity takes their side. | J → J |
| `BK.hd02.5#2` | L10 entry | When the weights drop, the ground’s going to shake. | Those hanging weights can crush me. Stay out from under. | plain → plain |
| `BK.hd03.1#0` | L11 entry | Karaköy. The café's shut. Cakes in the window. | Karaköy. Wedding tables, half-eaten food. No guests. | plain → plain |
| `BK.hd03.1#1` | L11 entry | Espresso machine still hissing. Nobody to serve. | Someone started the cake. Then everybody left. | J → plain |
| `BK.hd03.1#2` | L11 entry | Coffee smell and gulls. Nobody to order from. | Music on, lights on. I wish the guests were here. | plain → plain |
| `BK.hd03.2#1` | L12 entry | Sea wind on the pier. My hair's given up. | Sea wind on the pier. My hair's given up. | plain → J |
| `BK.hd03.2#2` | L12 entry | Keep to the middle of the boards. The edges are loose. | Watch the edge of the pier. No room to stumble. | plain → plain |
| `BK.hd03.3#1` | L13 entry | Paper lanterns swaying. Somebody's still celebrating. | Lanterns over the street. The wedding ended badly. | plain → plain |
| `BK.hd03.3#2` | L13 entry | The convoy's coming. Off the road, Arda. Now. | The wedding convoy's ahead. Keep clear of the cars. | plain → plain |
| `BK.hd03.4#0` | L14 entry | Gas tanks by the café. Pop one, they all go. | Those tanks are close. One blast could set off the next. | plain → plain |
| `BK.hd03.4#1` | L14 entry | Bloaters by the gas tanks. Real smart planning. | Gas tanks and bloaters together. Terrific seating plan. | J → J |
| `BK.hd03.4#2` | L14 entry | One pops and the lot goes. Keep your distance. | Those gas tanks could set each other off. Stay clear. | plain → plain |
| `BK.hd04.1#0` | L16 entry | Galata Bridge. Two decks, and lines on both. | Galata Bridge. Fishing lines across the walkway. | plain → plain |
| `BK.hd04.1#1` | L16 entry | Upper deck. Anglers still at the rail, reels clicking. | Fishing rods all along the rail. Mind the hooks. | plain → plain |
| `BK.hd04.1#2` | L16 entry | The bridge, and its fishing lines. Watch your feet. | A bridge full of hooks. Even the walkway wants a bite. | plain → J |
| `BK.hd04.2#1` | L17 entry | Rails lined with rods. Nobody's caught anything. | Fishing rods everywhere. Please tell me I'm not bait. | J → J |
| `BK.hd04.2#2` | L17 entry | Fog's rolling in. Good for hiding, bad for everything else. | Fog off the Golden Horn. Keep the railing in sight. | plain → plain |
| `BK.hd04.4#1` | L19 entry | Both ends of the bridge. Not great, bridge. | They're closing in from both ends. Keep a gap open. | plain → plain |
| `BK.hd04.4#2` | L19 entry | Fog, horns, zombies on both sides. Lovely. | Both ends blocked. That's a very thorough welcome. | plain → J |
| `BK.hd04.5#2` | L20 entry | The fisherman's already got his line in. | Look at that hook. Keep clear of his line. | plain → plain |
| `BK.hd05.1#0` | L21 entry | Eminönü. Spice, salt and fish. And zombies. | Eminönü. Still smells like dinner. That feels unfair. | plain → J |
| `BK.hd05.1#2` | L21 entry | Ferry horn somewhere. Nobody's going anywhere. | Ferry horn nearby. We need the fishing boats. | plain → plain |
| `BK.hd05.5#0` | L25 entry | The boat's lights are on. The captain's waiting. | Boat lights ahead. Stay with me, Kaan. | plain → plain |
| `BK.hd05.5#1` | L25 entry | The captain's on deck. Keep away from that anchor. | If that's your captain, let me get a better look. | plain → plain |
| `BK.hd05.5#2` | L25 entry | Boat lights in the dark. I've decided I don't like boats. | Keep close, Kaan. We'll check the boat together. | plain → plain |
| `BK.hd06.2#0` | L27 entry | Benches everywhere. Nobody's sitting on them. | We need the station keys. Stay alert, Kaan. | plain → plain |
| `BK.hd06.2#2` | L27 entry | One bulb flickering over the concourse. Great. | Every noise carries in here. Keep your voice down. | plain → plain |
| `BK.hd06.5#1` | L30 entry | The clock stopped. Somewhere, a train is late. | The trains stopped. The ticket checks survived. | J → J |
| `BK.hd06.5#2` | L30 entry | Nothing useful on the departure board. Keep looking. | No route on the board. We'll find one through the station. | plain → plain |
