# English combat, cards and flavor narrative audit — 2026-11-19

Reviewed **404 English variants** in three owned files; revised **181 variants**. Baseline: `/tmp/istanbul-en-endtoend-before-20261119/prototype/js/dialogue/en`. This is an original English pass from the scene and trigger, not a translation of the Turkish revision. No Turkish, world/district bark, story, runtime, simulation, key or pool-length change was made.

## Findings and editorial direction

- **Action truth:** acquisition cannot claim an enemy was struck, a car exploded, a route cleared, a rope caught a crowd or a disk returned. Rewrote those moments as Arda weighing a new capability, choosing what to try, or worrying about the consequences. Fireball bottles burst and burn where they land; they do not roll onward. Blacksmith healing requires a hit, not an empty swing.
- **Character rather than interface:** removed button instructions, repeated upgrade-name announcements, health-stat talk and unearned hero boasting. Kept the relief of real progress: mastery can feel good; being good at this can also bother him. His apartment goal, the borrowed knife, Dad’s practical habits and Mom’s care remain emotional anchors.
- **Comedy:** used original self-justification, misplaced consumer expectations, school/work habits and ordinary politeness under pressure. Examples: “I made a choice. Let’s not confuse that with a plan”; “If a car goes up, I’m calling that a parking solution”; “I should be horrified. Why am I a little impressed?” No show quotations, imitated catchphrases, brand targets or extra profanity were added.
- **Factual observations:** removed assumed torn clothes after a near-miss, invented lunch/breakfast omissions, guaranteed dash escapes, unsupported elite speed/weapon claims, a delivery box attached to the wrong place, and a diner napkin absent from the current actor description. Helmet advice now concerns getting around frontal protection, not aiming at an unsupported body part.
- **Ownership and intent:** removed fabricated construction-site visits, barbecue/dessert purchases, wedding provenance and a missing-eyebrow injury. The cleaver no longer makes Arda shrug off his promise to return Usta’s knife. Flavor gives the objects personality without inventing a pickup scene.
- **Shared temporal context:** low-level and late-level variants no longer promise a distant Ataköy when the apartment could already be close. Mom does not recommend a car after explaining the road is blocked. Source-bound warning copy uses the D121 living-source protections and avoids unnecessary current-action claims. Short active-skill reactions do not promise a fresh three-second shield or a crowd slow at delivery. The group-chat joke no longer asserts signal loss; a first ultimate charge does not imply prior use; quiet space does not mean no enemy is approaching farther away.

## Preserved material and limits

Kept strong existing lines where they already work: Mom asking for the snack box back; the battery check that cannot charge the phone; the pickle-jar comparison; a magnet that picks up after him; the runner whose cardio outlasted death; and the knife being “heavy, sharp, and still his.” Plain reactions remain available when the joke cooldown is closed.

The source-binding behavior is the existing D121 implementation; no runtime edits were made in this English pass. Action-event reactions still use the established short queue lifetime, so the text does not assume a brand-new attack at the moment it appears. Active skills may finish before their queued bark; revised lines describe the brief cover or personal response without a live countdown.

Some first-sighting pools identify established enemy mechanics before the player has seen an attack (for example the spitter’s acid). Those remain compact genre warnings, conditional intentions or visible-tool observations, not claims that a specific hit already occurred. This audit does not add enemy behavior or simulate a new tutorial.

Joke flags were revised only where the editorial function changed; no timing/budget values changed. Changed lines have their old `ok: 1` approval removed. The review sample is awaiting owner acceptance; a structural test pass is not a claim of universal comedic response.

## Validation

- Source snapshot comparison: unchanged keys and pool lengths; changed approvals removed; only the three owned English files edited.
- Most recent focused `node prototype/tools/test-dialogue.js` — PASS: 583 beats; TR 1,202 lines / EN 1,205 lines; identical simulation digest `12d2b67db8`; coverage, length, reviewed style, duplicates and joke-ratio checks pass. Captured output: `/tmp/istanbul-en-combat-cards-final-2026-11-19.log`. The final group-chat, first-use readiness and quiet-radius wording corrections are included in the root editor’s integrated verification scope; no extra editor rerun was requested.

## Inventory and exact placement

| File | Reviewed | Revised |
| --- | ---: | ---: |
| `barks-combat.js` | 235 | 83 |
| `barks-cards.js` | 162 | 92 |
| `cards-flavour.js` | 7 | 6 |

Joke-marked variants in these files: 105 before, 116 after. Variant indices below are zero-based. `plain → joke` or `joke → plain` records an intentional joke-flag change; unchanged flags are omitted.

| Beat / variant | Actual placement | Before | After | Flag change |
| --- | --- | --- | --- | --- |
| `BK.act.bloaterSwell#0` | bloaterSwell action event; D121 binds the unique living source within the encounter radius and rechecks its validity | It's swelling! Back, back, back, back! | It started swelling. I'm keeping my distance. |  |
| `BK.act.bloaterSwell#1` | bloaterSwell action event; D121 binds the unique living source within the encounter radius and rechecks its validity | It's about to vent. Hold your breath and go. | If that bursts, I don't want to be breathing it. |  |
| `BK.act.bloaterSwell#2` | bloaterSwell action event; D121 binds the unique living source within the encounter radius and rechecks its validity | Gonna pop? Not on my new sneakers, pal. | You don't have to make dying everybody else's problem. |  |
| `BK.act.bloaterSwell#3` | bloaterSwell action event; D121 binds the unique living source within the encounter radius and rechecks its validity | That thing's about to blow. Upwind, Arda, upwind. | That thing can burst. I'm not staying close. |  |
| `BK.act.bossSlam#0` | bossSlam action event; D121 binds the unique living source within the encounter radius and rechecks its validity | Shockwave! Get out of its path! | It hit the ground! Find somewhere else to stand! |  |
| `BK.act.bossSlam#1` | bossSlam action event; D121 binds the unique living source within the encounter radius and rechecks its validity | Hit the ground any harder and we'll both be downstairs. | Even the ground wants a piece of me. Terrific. |  |
| `BK.act.bossSlam#2` | bossSlam action event; D121 binds the unique living source within the encounter radius and rechecks its validity | That hit the whole street. Keep moving! | That was a heavy hit. Keep room to get around it. |  |
| `BK.act.bossSlam#3` | bossSlam action event; D121 binds the unique living source within the encounter radius and rechecks its validity | Still standing. My fillings aren't. | Don't wait here for the next one. Move, Arda. |  |
| `BK.act.bruteCharge#0` | bruteCharge action event; D121 binds the unique living source within the encounter radius and rechecks its validity | Charge! Sideways, Arda. Sideways, now! | That charge. Sideways, Arda. Next time, go sideways. |  |
| `BK.act.bruteCharge#1` | bruteCharge action event; D121 binds the unique living source within the encounter radius and rechecks its validity | Head down. It's coming straight at my chest. | Watch its shoulders. Don't meet it head-on. |  |
| `BK.act.bruteRoar#0` | bruteRoar action event; D121 binds the unique living source within the encounter radius and rechecks its validity | Windows are rattling. Keep your head down. | Heard that. Keep an eye on its arms. |  |
| `BK.act.spit#3` | spit action event; D121 binds the unique living source within the encounter radius and rechecks its validity | The puddles are bubbling. Don't step in them. | If that leaves a puddle, don't step in it. |  |
| `BK.act.summon#1` | summon action event; D121 binds the unique living source within the encounter radius and rechecks its validity | More of them heard it. Watch the side streets. | It's brought more with it. Check behind me. |  |
| `BK.act.summon#2` | summon action event; D121 binds the unique living source within the encounter radius and rechecks its validity | More coming out of the side street! | More of them. Don't let them spread around me. |  |
| `BK.boss#0` | bossIntro; large threat has entered, before the fight is won | Okay. The boss is here. Breathe, Arda. Breathe. | Okay. Give this one room. Lots of room. |  |
| `BK.boss#1` | bossIntro; large threat has entered, before the fight is won | This one's the real thing. Not a drill. | Keep somewhere to dodge. Don't get boxed in. |  |
| `BK.boss#3` | bossIntro; large threat has entered, before the fight is won | Knife in hand. Feet under me. Okay. | Feet under me. Keep my hands steady. |  |
| `BK.boss#4` | bossIntro; large threat has entered, before the fight is won | Boss is here. Can I speak to the manager? | Right. The exit has a supervisor. |  |
| `BK.close#2` | Enemy within 1.1 m; ongoing proximity rechecked | I'm backing up. Not running. Backing up. | Back up, Arda. Leave yourself somewhere to go. |  |
| `BK.close#5` | Enemy within 1.1 m; ongoing proximity rechecked | Close, but it's not reaching me. I'm pretty sure. | Too close. Don't wait to find out how far it can reach. |  |
| `BK.dad#3` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | Dad would say fix it or leave it. I'm leaving it. | Dad could fix a toaster. I wish this were a toaster. |  |
| `BK.dash#0` | Dash activation, not proof of escape or a safe landing | Dashed. Not bad for someone who skipped lunch. | I owe my gym teacher an apology. Later. |  |
| `BK.dash#1` | Dash activation, not proof of escape or a safe landing | Dashed, ran, made it. That's the whole plan. | Keep going. I can catch my breath when there's room. |  |
| `BK.dash#2` | Dash activation, not proof of escape or a safe landing | Made it through. Now keep that gap open. | Find space before I try that again. |  |
| `BK.elite#0` | Elite spawn; D121 requires a unique living nearby source and keeps the bubble bound to it | The big one's carrying something. Careful. | That one looks harder to put down. Leave some room. |  |
| `BK.elite#3` | Elite spawn; D121 requires a unique living nearby source and keeps the bubble bound to it | Elite zombie. Eyes on it. Don't blink. | Watch this one. Don't let it get behind me. |  |
| `BK.fk.bloater#2` | First active nearby bloater sighting (7 m), not first kill; no prior attack required | Red hoodie. Finally, a practical fashion choice. | I miss when gas leaks had warning labels. |  |
| `BK.fk.cayci#1` | First active nearby cayci sighting (7 m), not first kill; no prior attack required | A walking cafe with bad aim and worse manners. | Still carrying the tea. I'd have quit by now. |  |
| `BK.fk.marti#2` | First active nearby marti sighting (7 m), not first kill; no prior attack required | Shadow on the sidewalk. It's diving. Move! | Keep an eye on that gull. It could dive for my stuff. |  |
| `BK.fk.copci#0` | First active nearby copci sighting (7 m), not first kill; no prior attack required | Street sweeper. Watch what he does with that trash can. | Street cleaner. That broom's still in his hands. |  |
| `BK.fk.copci#1` | First active nearby copci sighting (7 m), not first kill; no prior attack required | Keep clear of that trash can. He could roll it this way. | Give him some room. Keep watching his hands. |  |
| `BK.fk.crawler#1` | First active nearby crawler sighting (7 m), not first kill; no prior attack required | It crawled right off the curb. There goes my shortcut. | At ankle height. Great. A threat I can trip over. | plain → joke |
| `BK.fk.crawler#2` | First active nearby crawler sighting (7 m), not first kill; no prior attack required | How did this one crawl all the way up the street? | I almost missed that one. Keep watching the ground. |  |
| `BK.fk.diner#1` | First active nearby diner sighting (7 m), not first kill; no prior attack required | Half a meal still on the table. Nobody finished. | He was eating a minute ago. Now he's looking at me. |  |
| `BK.fk.diner#2` | First active nearby diner sighting (7 m), not first kill; no prior attack required | Napkin still in his collar. Somebody taught him manners. | He's still holding the plate. Look at his face. |  |
| `BK.fk.elite#1` | First active nearby elite sighting (7 m), not first kill; no prior attack required | Elite. Bigger, slower, sharper. Watch the arms. | That one's tougher. I need room to get around it. |  |
| `BK.fk.elite#2` | First active nearby elite sighting (7 m), not first kill; no prior attack required | Elite zombie. Very handsome. Nobody's home, though. | Elite? Great. Even the dead have a promotion system. |  |
| `BK.fk.hardhat#0` | First active nearby hardhat sighting (7 m), not first kill; no prior attack required | Hard hat, so it's site safety. Shame about the brain. | Helmet on. Finally, someone dressed for this. |  |
| `BK.fk.hardhat#1` | First active nearby hardhat sighting (7 m), not first kill; no prior attack required | That helmet covers his head. Find another angle. | That helmet's thick. I'll try getting around behind him. |  |
| `BK.fk.hardhat#2` | First active nearby hardhat sighting (7 m), not first kill; no prior attack required | Hard hat. Look for an opening around it. | He's slow to turn. Maybe I can slip around him. |  |
| `BK.fk.kasap#0` | First active nearby kasap sighting (7 m), not first kill; no prior attack required | Butcher. Apron's covered in it. Don't ask what. | I liked it better when the cleaver stayed behind a counter. |  |
| `BK.fk.kasap#2` | First active nearby kasap sighting (7 m), not first kill; no prior attack required | A butcher. Calm for ages, then all at once. | Watch his arm. When that cleaver goes up, back off. |  |
| `BK.fk.kurye#2` | First active nearby kurye sighting (7 m), not first kill; no prior attack required | That delivery box is still strapped to its back. | The delivery box is still strapped to that scooter. |  |
| `BK.fk.zehirli#0` | First active nearby zehirli sighting (7 m), not first kill; no prior attack required | Toxic spit. Smells like a bus station in August. | That tank isn't full of air freshener, is it? |  |
| `BK.fk.zehirli#2` | First active nearby zehirli sighting (7 m), not first kill; no prior attack required | Poison cloud. Go around it. | Don't get caught on the wrong side of that spray. |  |
| `BK.frenzy#0` | Frenzy activates after a kill streak; no unarmed-only mode or meal history implied | Okay, I've lost it. Hands only, no thinking. | My hands are moving faster than I can think. Hold on. |  |
| `BK.frenzy#1` | Frenzy activates after a kill streak; no unarmed-only mode or meal history implied | Frenzy mode. Arda 2.0. Fueled by fumes and no breakfast. | Adrenaline. The body's least reassuring energy drink. |  |
| `BK.frenzy#2` | Frenzy activates after a kill streak; no unarmed-only mode or meal history implied | Blood, adrenaline. I'm here. Don't blink. | Easy, Arda. Pick a direction. Keep your feet moving. |  |
| `BK.idle#6` | Shared pool; see story/barks.js | Nothing's coming. Good. Let's keep it that way. | Nothing close. Good. Now pick a way through. |  |
| `BK.mom#4` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | If Mom saw this walk, she'd tell me to take the car. | I should tell Mom I heard her. All of it. |  |
| `BK.mom#6` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | Lock the door, she'd say. Which door? They're all gone. | Mom checks the lock twice. I used to roll my eyes. |  |
| `BK.near#3` | Near-miss; no wound or torn-clothing outcome asserted | Missed my neck, got the hoodie. Mom's going to be furious. | Missed me. I almost apologized. What is wrong with me? |  |
| `BK.self#0` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | Okay, Arda. Plan: walk. Step two: more walking. | I've revised my position on violence. Under duress. |  |
| `BK.self#1` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | No signal, no group chat. Guess I'm the group chat now. | A group chat with just me. Still can't stay on topic. |  |
| `BK.self#6` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | When this is over, I'm never telling anyone about this. | I don't know how I'm going to tell Mom about this. |  |
| `BK.self#7` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | Is there tea in Ataköy? Or am I walking for nothing? | All this to get home. I used to complain about the bus. | plain → joke |
| `BK.self#8` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | My feet are tired. Are they? Yes. Yes, they are. | My legs won't stop shaking. Fine. Shake while we walk. | plain → joke |
| `BK.self#13` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | Same street, same zombies, different doors. | I keep expecting someone to tell me this is a mistake. |  |
| `BK.self#21` | Quiet, no-signal ambient self-talk; L1, danger, phone and grief gates apply | Ataköy's still a long way off. Fine. Keep going. | Get to the apartment. Stay with that. One thing at a time. |  |
| `BK.streak.10#0` | Kill streak reaches 10; successive kills within 2.5 s | Ten. Okay, maybe I'm a natural. Apparently. | Ten. I didn't think I'd get past the first one. |  |
| `BK.streak.10#4` | Kill streak reaches 10; successive kills within 2.5 s | Ten. Don't look up. Keep the rhythm. | Ten. Watch the next one. Don't get distracted. |  |
| `BK.streak.10#5` | Kill streak reaches 10; successive kills within 2.5 s | Ten! Somebody write this down, please. | Ten. I can still feel my hands. Keep them steady. |  |
| `BK.streak.100#0` | Kill streak reaches 100; successive kills within 2.5 s | A hundred. This needs a trophy. Or a dürüm. | A hundred. Great. I've made counting upsetting. |  |
| `BK.streak.100#1` | Kill streak reaches 100; successive kills within 2.5 s | A hundred. Somebody tell the world. Please. | A hundred. I need a minute. They're not giving me one. |  |
| `BK.streak.100#2` | Kill streak reaches 100; successive kills within 2.5 s | A hundred. I'm not even tired. That worries me. | A hundred. How am I still standing? |  |
| `BK.streak.25#0` | Kill streak reaches 25; successive kills within 2.5 s | Twenty-five. This isn't a fight anymore. It's a dance. | Twenty-five. I miss when a bad day just meant a quiz. |  |
| `BK.streak.25#2` | Kill streak reaches 25; successive kills within 2.5 s | Twenty-five. Don't look back. Don't look down. | Twenty-five. Check behind me. Don't let them close in. |  |
| `BK.streak.50#1` | Kill streak reaches 50; successive kills within 2.5 s | Fifty. Okay, that's enough. Somebody bring me a tea. | Fifty. I need a sip of water and a way out. |  |
| `BK.ult#0` | Ultimate activated; any equipped ultimate, no guaranteed hit or cleared street | Last move. I'm still standing. | Everything I've got. Come on! |  |
| `BK.ult#1` | Ultimate activated; any equipped ultimate, no guaranteed hit or cleared street | Ultimate on. Okay. Okay, okay, okay. | Here goes. If this works, keep moving. |  |
| `BK.ult#2` | Ultimate activated; any equipped ultimate, no guaranteed hit or cleared street | Mega strike. Nobody messes with me now. | Give me a way through. That's all I need. |  |
| `BK.ult#3` | Ultimate activated; any equipped ultimate, no guaranteed hit or cleared street | Ultimate! Please let this be the good kind of loud. | That took a lot out of me. Keep my feet moving. |  |
| `BK.ult#4` | Ultimate activated; any equipped ultimate, no guaranteed hit or cleared street | I gave it everything. Your turn now. | That was my backup plan. I'm accepting suggestions. |  |
| `BK.ult#5` | Ultimate activated; any equipped ultimate, no guaranteed hit or cleared street | Final move done. Breathe, Arda. | All right. Used it. Find the next opening. |  |
| `BK.ultr#0` | Ultimate charged; readiness rather than an instruction to press a UI button | Ready! Go on, press it. | Okay. I've got something left if I need it. |  |
| `BK.ultr#1` | Ultimate charged; readiness rather than an instruction to press a UI button | Final move's charged. Honestly, I'm excited. | I've got the energy. Now I need the right moment. |  |
| `BK.ultr#2` | Ultimate charged; readiness rather than an instruction to press a UI button | Full charge. Could blow up the whole street. | I feel ready. I'm choosing not to question that. |  |
| `BK.zq#2` | L6+ quiet walker exchange; only one nearby ordinary walker, healthy/unhit hero, no phone or boss | What? You've got something to say? | Stay on that side. I'll take this side. |  |
| `BK.zq#3` | L6+ quiet walker exchange; only one nearby ordinary walker, healthy/unhit hero, no phone or boss | Your mouth's open. Did you have a point? | No, keep your mouth shut. I understand enough. |  |
| `BK.zq#5` | L6+ quiet walker exchange; only one nearby ordinary walker, healthy/unhit hero, no phone or boss | Any chance you'll let me past? | Let me past. I'm being very reasonable for food. |  |
| `BK.zq#13` | L6+ quiet walker exchange; only one nearby ordinary walker, healthy/unhit hero, no phone or boss | Walking too? Travel buddies? No? Okay, bad idea. | I'm taking the long way. Please don't make it longer. |  |
| `BK.zreact#6` | L6+ quiet walker exchange; only one nearby ordinary walker, healthy/unhit hero, no phone or boss | Ugh. You sound bored too, honestly. | Okay. That sounded like a no. I'm going around. |  |
| `BK.zreact#9` | L6+ quiet walker exchange; only one nearby ordinary walker, healthy/unhit hero, no phone or boss | How am I supposed to read that? | Sure. I'll assume that means 'keep moving'. | plain → joke |
| `BK.card.cable#1` | cardChosen → cable; acquisition/upgrade, not an attack or hit | The cable's crackling. Oh, lovely. | That crackle does not make me feel qualified. |  |
| `BK.card.canister#1` | cardChosen → canister; acquisition/upgrade, not an attack or hit | A canister. Not for a picnic, but it'll do. | A gas canister. Don't drop it at my feet. |  |
| `BK.card.chain#0` | cardChosen → chain; acquisition/upgrade, not an attack or hit | Bike chain. Try not to wrap it around your leg. | Bike chain. I seem to be assembling a worse bike. |  |
| `BK.card.chain#1` | cardChosen → chain; acquisition/upgrade, not an attack or hit | Chain's ready. I wish I had my bike. | Chain's solid. I need some room to swing it. |  |
| `BK.card.chainsaw#1` | cardChosen → chainsaw; acquisition/upgrade, not an attack or hit | If it stalls, I wait. Me and the chainsaw both. | A chainsaw. I'm dangerously close to feeling qualified. |  |
| `BK.card.energy#0` | cardChosen → energy; acquisition/upgrade, not an attack or hit | Energy drink. It's a lifestyle now. | Energy drink. I need to keep my eyes open. |  |
| `BK.card.extinguisher#1` | cardChosen → extinguisher; acquisition/upgrade, not an attack or hit | Fire extinguisher. This time the fire goes out. | Pressure's good. Let's keep the handle steady. |  |
| `BK.card.fireworks#0` | cardChosen → fireworks; acquisition/upgrade, not an attack or hit | Fireworks! Left over from a wedding. Congrats, I guess. | Fireworks. Great. A celebration I can aim at someone. |  |
| `BK.card.fireworks#2` | cardChosen → fireworks; acquisition/upgrade, not an attack or hit | Fireworks. Tip: point them away from your face. | Hold them straight. I don't get a practice launch. |  |
| `BK.card.gen#1` | cardChosen → gen; acquisition/upgrade, not an attack or hit | Mom would approve. Then she'd ask if I ate. | I made a choice. Let's not confuse that with a plan. |  |
| `BK.card.gloves#0` | cardChosen → gloves; acquisition/upgrade, not an attack or hit | Work gloves. Now my hands get to be heroes too. | Better grip. Maybe I'll stop squeezing so hard. |  |
| `BK.card.gloves#1` | cardChosen → gloves; acquisition/upgrade, not an attack or hit | Gloves on. Time for some punching. | Gloves on. I can feel the handle properly now. |  |
| `BK.card.gloves#2` | cardChosen → gloves; acquisition/upgrade, not an attack or hit | Work gloves. Good grip, bad fashion. | Work gloves. My hands got a job before I did. | plain → joke |
| `BK.card.jacket#1` | cardChosen → jacket; acquisition/upgrade, not an attack or hit | Mom hates this jacket. Wearing it anyway. | A jacket. Twenty years of nagging, and she was right. |  |
| `BK.card.knife#2` | cardChosen → knife; acquisition/upgrade, not an attack or hit | Back in my hand. Sharp, heavy, and it feels right. | Same knife. I'll get it back to Usta. Somehow. |  |
| `BK.card.magnet#0` | cardChosen → magnet; acquisition/upgrade, not an attack or hit | Magnet. Everything comes to me now. | I won't have to chase every last coin. Good. |  |
| `BK.card.manhole#2` | cardChosen → manhole; acquisition/upgrade, not an attack or hit | Throw it low, aim for the knees. Heavy lid, go. | Get a grip under the rim. Don't let it slip. |  |
| `BK.card.medkit#1` | cardChosen → medkit; acquisition/upgrade, not an attack or hit | Bandages, tape, and a little hope. It'll do. | Tape, bandages. Keep these where I can reach them. |  |
| `BK.card.molotov#2` | cardChosen → molotov; acquisition/upgrade, not an attack or hit | Burning bottle. Suddenly I miss having eyebrows. | Fire in a bottle. So much for responsible recycling. |  |
| `BK.card.nailgun#0` | cardChosen → nailgun; acquisition/upgrade, not an attack or hit | Nail gun. Every handyman's dream. And mine. | Nails loaded. I can keep them at a distance. |  |
| `BK.card.sawblade#0` | cardChosen → sawblade; acquisition/upgrade, not an attack or hit | Saw blade off a construction site. Borrowed. Probably. | Saw blade. I have questions. None about woodworking. |  |
| `BK.card.sawblade#1` | cardChosen → sawblade; acquisition/upgrade, not an attack or hit | Teeth, sparks, and nobody's giving me grief now. | I'll need space to throw this. And to stay upright. |  |
| `BK.card.sledge#0` | cardChosen → sledge; acquisition/upgrade, not an attack or hit | Sledgehammer! Heavy, but fair. | Okay. Both hands. Don't let the weight pull me over. |  |
| `BK.card.sledge#1` | cardChosen → sledge; acquisition/upgrade, not an attack or hit | Sledgehammer. Let's go through this door too. | I can move them back with this. If I keep my footing. |  |
| `BK.card.sledge#2` | cardChosen → sledge; acquisition/upgrade, not an attack or hit | Sledgehammer. Subtle is for other people. | It's a tool. That feels better than calling it a weapon. | plain → joke |
| `BK.card.slingshot#0` | cardChosen → slingshot; acquisition/upgrade, not an attack or hit | Slingshot! My proudest childhood skill. | Slingshot. A skill school told me to stop using. | plain → joke |
| `BK.card.slingshot#2` | cardChosen → slingshot; acquisition/upgrade, not an attack or hit | Slingshot. Childhood skills never really leave you. | Pull, aim, let go. I remember this part. |  |
| `BK.card.speargun#1` | cardChosen → speargun; acquisition/upgrade, not an attack or hit | Speargun. Works for fishing too. | Line's attached. Keep it clear of my hands. |  |
| `BK.card.speargun#2` | cardChosen → speargun; acquisition/upgrade, not an attack or hit | A speargun. I'm not fishing for compliments. | A speargun. Grandpa's going to ask what I caught. |  |
| `BK.card.torch#0` | cardChosen → torch; acquisition/upgrade, not an attack or hit | Blowtorch. Bought it for dessert. Now it's for zombies. | A blowtorch. I used to complain about burnt toast. |  |
| `BK.card.torch#1` | cardChosen → torch; acquisition/upgrade, not an attack or hit | Flame's ready. The only real risk is me. | The flame's ready. I'm still working on my nerves. |  |
| `BK.evo.arcchain#0` | evolve → arcchain; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Arc Chain! It jumps from one to the next. | A live chain. One good hit could reach the next one. |  |
| `BK.evo.arcchain#1` | evolve → arcchain; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Wet ground carries the chain further. Watch your feet. | Wet ground would help. Anything to save my arms. |  |
| `BK.evo.arcchain#2` | evolve → arcchain; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Lightning's jumping between them. Not my problem. Yet. | Electricity gets to take shortcuts. I get to walk. | plain → joke |
| `BK.evo.blacksmith#0` | evolve → blacksmith; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Blacksmith's Swing! Every hit gives a little life back. | Hit something, catch my breath. I can work with that. |  |
| `BK.evo.blacksmith#1` | evolve → blacksmith; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Each swing patches me up a bit. Slow, heavy, and fair. | If I land the blow, maybe my hands will stop shaking. |  |
| `BK.evo.blacksmith#2` | evolve → blacksmith; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Each hit patches me up. Cheaper than a clinic, too. | Violence is medicine now. I'm not explaining this to Mom. |  |
| `BK.evo.carbomb#0` | evolve → carbomb; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Car Bomb Tour! The canister by the parked car blows bigger. | Land it near a car and let the fuel do the rest. |  |
| `BK.evo.carbomb#1` | evolve → carbomb; delayed acquisition reaction, no hit/kill/cleared-route guarantee | That bang woke up the whole street. Sorry, neighbors. | I'm keeping my distance when this thing lands. |  |
| `BK.evo.carbomb#2` | evolve → carbomb; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The parked car went up too. Not much of a tour. | If a car goes up, I'm calling that a parking solution. |  |
| `BK.evo.cleaver#0` | evolve → cleaver; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The Usta's Cleaver. The cook's blade is mine now. | Usta's blade. I still owe him this in one piece. |  |
| `BK.evo.cleaver#2` | evolve → cleaver; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The Usta's Cleaver. I'll give it back. Probably. | I owe Usta a knife. And a very uncomfortable explanation. |  |
| `BK.evo.cluster#0` | evolve → cluster; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Cluster bomb! Not a picnic. A fireworks show. | One explosion wasn't enough. Apparently I have standards. |  |
| `BK.evo.cluster#2` | evolve → cluster; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Cluster bomb. Nobody stand in that. | Once I throw it, I'm not chasing it. |  |
| `BK.evo.cyclone#0` | evolve → cyclone; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Chain cyclone! My leg didn't get tangled. Lucky. | A spinning chain. So much for talking things through. |  |
| `BK.evo.cyclone#2` | evolve → cyclone; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Spinning, not falling. Keep spinning. | Keep my balance. Let the chain make the rounds. |  |
| `BK.evo.finale#0` | evolve → finale; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Wedding finale! Hope the bride doesn't mind. | I don't remember agreeing to this much celebrating. |  |
| `BK.evo.finale#1` | evolve → finale; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Finale! This time the applause is mine. | Rockets ready. Need somewhere to send all this noise. |  |
| `BK.evo.finale#2` | evolve → finale; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Sorry, bride. I'm borrowing your finale. | Aim for the crowd. Leave myself a way through. | joke → plain |
| `BK.evo.fireball#0` | evolve → fireball; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Fireball! Gassed bottles turn into fireballs now. | Gas in the bottle. That's going to make a bigger mess. |  |
| `BK.evo.fireball#1` | evolve → fireball; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The bottle hits, then rolls on, still burning. | It'll burst where it lands. I need to pick the spot. |  |
| `BK.evo.fireball#2` | evolve → fireball; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Molotov turned fireball. That went further than planned. | I should be horrified. Why am I a little impressed? |  |
| `BK.evo.foamstorm#0` | evolve → foamstorm; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Foam Storm! Wider spray, stickier foam. | That's a lot of foam. I can put it between us. |  |
| `BK.evo.foamstorm#1` | evolve → foamstorm; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The foam catches the spit mid-air. Clean. | The foam should catch spit. Keep it in front of me. |  |
| `BK.evo.foamstorm#2` | evolve → foamstorm; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Foam on the road, on them, and a bit on me. | Industrial foam. Finally, a civilized way to panic. |  |
| `BK.evo.forge#1` | evolve → forge; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The ground is black where it burned. Nobody walks here. | Hold the flame low. Let it keep burning after I move. |  |
| `BK.evo.forge#2` | evolve → forge; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Hotter than my mom's stove. Don't tell her. | I could cook with this. I am not eating what it cooks. |  |
| `BK.evo.gen#1` | evolve → gen; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Evolution done. Now let me evolve too. | Okay. Don't rush it. Get a feel for this thing. |  |
| `BK.evo.grinder#1` | evolve → grinder; delayed acquisition reaction, no hit/kill/cleared-route guarantee | No stalling now. It gets angrier the longer I hold it. | Keep it on the same one. Don't let my grip go. |  |
| `BK.evo.grinder#2` | evolve → grinder; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The engine never chokes. Unlike me on a Monday. | No more stalling. There goes my excuse to stop. |  |
| `BK.evo.hookpull#0` | evolve → hookpull; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Hook Pull! Come here, all of you. | The hook can bring company. Leave some room, Arda. |  |
| `BK.evo.hookpull#1` | evolve → hookpull; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The hook catches, and the rest come to me. | Catch one and the rope can drag the others in. |  |
| `BK.evo.hookpull#2` | evolve → hookpull; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The rope pulls tight and the crowd lurches my way. | A group hug. I'm going to regret inventing that. | plain → joke |
| `BK.evo.lake#0` | evolve → lake; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Fire Lake. The burning puddles have joined up. | Land the bottles together. Let the fire spread. |  |
| `BK.evo.lake#1` | evolve → lake; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The flames have met in the middle. No walking around that. | Put the fire in their way. Buy myself a few steps. |  |
| `BK.evo.minibus#0` | evolve → minibus; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Minibus Door! It slams down on anything close by. | Drop the door hard. Give myself a second to get clear. |  |
| `BK.evo.minibus#1` | evolve → minibus; delayed acquisition reaction, no hit/kill/cleared-route guarantee | The door slams shut. Whoever was near is dazed. | They might stagger when it lands. That's my chance. |  |
| `BK.evo.minibus#2` | evolve → minibus; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Slammed it like a full minibus at rush hour. | Minibus door. For once, I'm deciding when it shuts. |  |
| `BK.evo.nailstorm#1` | evolve → nailstorm; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Nail storm! The neighbors are going to complain. | Plenty of nails. Now I need a clear shot. |  |
| `BK.evo.nailstorm#2` | evolve → nailstorm; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Nail storm. Loud. Very loud. Keep going. | This is going to be loud. Keep them in front of me. |  |
| `BK.evo.netspear#0` | evolve → netspear; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Net Spear! Everything I pinned is roped together now. | The ropes can hold them together. I'll try a group. |  |
| `BK.evo.netspear#1` | evolve → netspear; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Roped in a line. Now I can deal with them in one go. | If I catch them together, one hit could reach both. |  |
| `BK.evo.netspear#2` | evolve → netspear; delayed acquisition reaction, no hit/kill/cleared-route guarantee | All tied up in a line, like a school trip gone wrong. | One rope, several problems. Call that teamwork. |  |
| `BK.evo.stormshield#1` | evolve → stormshield; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Dodge, and it zaps anyway. Even the shield is stubborn. | If the charm saves me, the shield gets a shot too. |  |
| `BK.evo.twinsaw#0` | evolve → twinsaw; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Twin Saw! Two discs flying side by side. | Two blades. Okay. My hands are still shaking. |  |
| `BK.evo.twinsaw#1` | evolve → twinsaw; delayed acquisition reaction, no hit/kill/cleared-route guarantee | Two discs, one left and one right. Clean and simple. | Both blades come back. Don't lose sight of them. |  |
| `BK.evo.twinsaw#2` | evolve → twinsaw; delayed acquisition reaction, no hit/kill/cleared-route guarantee | They fly in step. I just have to keep up. | Two blades. I'm outsourcing my terrible decisions. | plain → joke |
| `BK.lvlC#0` | levelup → experience band C; shared between journey levels | Almost a hero now. Almost. | Better at this. Still deeply opposed to doing it. |  |
| `BK.lvlD#0` | levelup → experience band D; shared between journey levels | That many levels? Who even is this guy? | I'm improving. I'd like to file a complaint about why. |  |
| `BK.lvlD#1` | levelup → experience band D; shared between journey levels | People expect something from me now. Right. | My hands feel steadier. Keep it that way. |  |
| `BK.mastery#1` | masteryMove; performed technique, not a guaranteed hit | Like a pro. Or at least a very determined one. | I meant to do that. I'm going to keep saying that. |  |
| `BK.mastery#2` | masteryMove; performed technique, not a guaranteed hit | This move's going to be my signature. | Remember that motion. Don't rush the next one. |  |
| `BK.mastery#3` | masteryMove; performed technique, not a guaranteed hit | Move's down cold. Now I want applause. | Okay. I felt that one work. Do it again. |  |
| `BK.mod#3` | modChosen; upgrade selection | Good mod. Didn't read the manual, though. | Looks secure. Check the grip before I try it. |  |
| `BK.mod#4` | modChosen; upgrade selection | Usta Cemal would nod at this. Slowly, like always. | Dad makes this look easy. I should've paid attention. |  |
| `BK.skill.shield#0` | Shield skill used; one hit of protection, up to 3 s, may expire before bark delivery | Simit Shield! Tray up, three seconds of cover. | The tray's only a moment of cover. I need room. |  |
| `BK.skill.shield#1` | Shield skill used; one hit of protection, up to 3 s, may expire before bark delivery | Tray up. Keep watching for the next hit. | Don't count on the tray twice. Keep watching their hands. |  |
| `BK.skill.shield#2` | Shield skill used; one hit of protection, up to 3 s, may expire before bark delivery | The baker is going to want that tray back. | Someone's going to want this tray back. Not right now. |  |
| `BK.skill.tea#0` | Tea skill used; timed healing/slow, may have no nearby enemy or missing health | Tea break. One sip, a little breath, a little health. | One sip. One breath. Don't spill the rest. |  |
| `BK.skill.tea#1` | Tea skill used; timed healing/slow, may have no nearby enemy or missing health | Tea's poured and the crowd slows right down. | I needed that. I can breathe a little easier. |  |
| `BK.fk.guvercin#0` | First active nearby guvercin sighting (7 m), not first kill; no prior attack required | The pigeon's circling the loot. Grab it first. | A pigeon. Better get to anything useful before it does. |  |
| `BK.fk.guvercin#2` | First active nearby guvercin sighting (7 m), not first kill; no prior attack required | It's circling my drops. Grab them before it does. | Keep an eye on that bird. It could grab the next drop. |  |
| `flav.cardoor#0` | Item/card flavor: cardoor; displayed beside class-B rules | Car door, torn off. Owner's still looking for parking. | I'm borrowing the door. The car can keep the rest. |  |
| `flav.finale#0` | Item/card flavor: finale; displayed beside class-B rules | Wedding finale! | Somebody budgeted for all this. I'm the bad investment. |  |
| `flav.manhole#0` | Item/card flavor: manhole; displayed beside class-B rules | Manhole cover, lifted by hand. Heavier than it looked. | I took the lid. The sewer gets custody of the hole. | plain → joke |
| `flav.sawblade#0` | Item/card flavor: sawblade; displayed beside class-B rules | Saw blade from a construction site. Taken, not borrowed. | A saw blade. Apparently the rest of the saw was optional. | plain → joke |
| `flav.shoes#0` | Item/card flavor: shoes; displayed beside class-B rules | Running shoes, a little worn. Running is the plan. | They fit. That's one thing today that makes sense. |  |
| `flav.torch#0` | Item/card flavor: torch; displayed beside class-B rules | Blowtorch, bought for the barbecue. Plans changed. | A blowtorch. Some assembly of bad ideas required. |  |
