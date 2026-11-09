// Arda's English barks (v0.7, W2-EN). Written natively in English, never translated from strings-barks.js.
// Format: P.BarkPools.en[poolKey] = [{ t: 'line', j: 1 }]. j: 1 marks a real joke. Target: about a quarter of lines, never over 30%.
// Every line is 60 characters or fewer. Most lines are plain, tense, tired or sincere. Mum and Dad, not Mom and Dad.
// Pool key = the engine prefix without its trailing dot: 'BK.fk.walker.' -> 'BK.fk.walker'. Same keys as strings-barks.js and B.pools in barks.js.
// Wiring notes for the engine:
//  - Hood stages: one pool per stage, keyed by the full stage id ('BK.hd01.1' ... 'BK.hd20.5'), 3 lines each.
//    The engine must read P.BarkPools.en for these. barks.js today builds hood pools from the P.LINES prefix.
//  - Boss intros share one pool 'BK.boss'. Elite spawns: 'BK.elite'. First elite kill: 'BK.fk.elite'.
//  - zq / zr / zreact are NOT paired by index. barks.js picks each one on its own (zq now, zr at +1.4 s, zreact at +3.0 s),
//    so every zreact line must work after any zq and any zr. zr lines are zombie groans and carry no jokes.
//  - Self-talk (self / mom / dad / idle) is the most human layer: sincere and tired first, jokes second.
P.BarkPools = P.BarkPools || {};
P.BarkPools.en = {};

// First kill of each enemy type (once per run). Pool per type.
P.BarkPools.en['BK.fk.walker'] = [
  { t: "A walker. Slow, and not in any hurry about it." },
  { t: "One down. Keep it simple, keep it moving." },
  { t: "Walkers are easy. Just don't let them corner you." }
];
P.BarkPools.en['BK.fk.runner'] = [
  { t: "A runner. Right, so now I have to be faster." },
  { t: "Runner. About ten seconds before he's on me." },
  { t: "Runner. Feet under you, head up. Go." }
];
P.BarkPools.en['BK.fk.crawler'] = [
  { t: "Came up out of a drain. I'm not a plumber, mate.", j: 1 },
  { t: "A crawler. Low to the ground. Eyes down." },
  { t: "Crawling. How did this one get this far?" }
];
P.BarkPools.en['BK.fk.diner'] = [
  { t: "The restaurant one. Left without paying. Rude.", j: 1 },
  { t: "Half a meal still on the table. Nobody finished." },
  { t: "Napkin still tucked in his collar. Who does that?" }
];
P.BarkPools.en['BK.fk.spitter'] = [
  { t: "Spitting's rude. That's the least of my problems.", j: 1 },
  { t: "Its spit is acid. Stay out of its line." },
  { t: "Spitter. Eyes up and keep moving." }
];
P.BarkPools.en['BK.fk.bloater'] = [
  { t: "Bloater. Swollen tight. Don't get close." },
  { t: "Like a balloon someone forgot to tie. Keep back.", j: 1 },
  { t: "Pop it from a distance. Please, from a distance." }
];
P.BarkPools.en['BK.fk.brute'] = [
  { t: "A door, or a man? I'm going with a door.", j: 1 },
  { t: "Brute. Stay out of arm's reach." },
  { t: "Brute. Keep your distance and your nerve." }
];
P.BarkPools.en['BK.fk.screamer'] = [
  { t: "It's screaming. Trying to wake the whole street?" },
  { t: "A screamer. My ears are still ringing." },
  { t: "Screaming. Now everyone in the street knows." }
];
P.BarkPools.en['BK.fk.hardhat'] = [
  { t: "Hard hat, so it's site safety. Shame about the brain.", j: 1 },
  { t: "Hard hat on. Head shots are still the rule." },
  { t: "Hard hat. Rule one still applies, Arda." }
];
P.BarkPools.en['BK.fk.elite'] = [
  { t: "Elite. Is this the boss? Feels like the boss." },
  { t: "Elite. Bigger, slower, sharper. Watch the arms." },
  { t: "Elite zombie. Very handsome. Nobody's home, though.", j: 1 }
];
P.BarkPools.en['BK.fk.kasap'] = [
  { t: "Butcher. Apron's covered in it. Don't ask what.", j: 1 },
  { t: "Stay out of range of that cleaver." },
  { t: "A butcher. Calm for ages, then all at once." }
];
P.BarkPools.en['BK.fk.parkur'] = [
  { t: "Free-runner. Leaps over everything. I just run." },
  { t: "Don't jump at me! I can't jump without falling over.", j: 1 },
  { t: "Keep your eyes on his feet, not his flips." }
];
P.BarkPools.en['BK.fk.zehirli'] = [
  { t: "Toxic spit. Smells like a bus station in August.", j: 1 },
  { t: "It left a cloud behind. Breathing's on my list now." },
  { t: "Poison spit. Hold your breath and walk through it." }
];

// Kill streaks: 10, 25, 50, 100 in a row (frequent pools, more lines).
P.BarkPools.en['BK.streak.10'] = [
  { t: "Ten. Okay, I'm a natural at this. Apparently." },
  { t: "Ten in a row. Mum would still ask if I've eaten.", j: 1 },
  { t: "Ten. Wait, this is easy? I don't trust it." },
  { t: "Ten. Hands shaking, but I'm still standing." },
  { t: "Ten. Don't look up. Just keep the rhythm." },
  { t: "Ten! Somebody write this down, please." }
];
P.BarkPools.en['BK.streak.25'] = [
  { t: "Twenty-five. This isn't a fight, it's a dance.", j: 1 },
  { t: "Twenty-five. If head-smashing counts as cardio...", j: 1 },
  { t: "Twenty-five. Lungs on fire, arms fine. Keep going." },
  { t: "Twenty-five. Don't look back. Don't look down." }
];
P.BarkPools.en['BK.streak.50'] = [
  { t: "Fifty. This is a job now. I want a salary.", j: 1 },
  { t: "Fifty. Okay, that's enough. Somebody get me a tea." },
  { t: "Fifty. My arms have stopped asking questions.", j: 1 },
  { t: "Fifty. Water. Please. Just a little water." }
];
P.BarkPools.en['BK.streak.100'] = [
  { t: "A hundred. This needs a trophy. Or a sandwich.", j: 1 },
  { t: "A hundred. Somebody tell the world, please." },
  { t: "A hundred. I'm not even tired. That's worrying.", j: 1 }
];

// Boss intros: all six share one pool.
P.BarkPools.en['BK.boss'] = [
  { t: "Right. The boss has turned up. Breathe, Arda." },
  { t: "This one's the real thing. Not a drill." },
  { t: "Running away. Rude, or just sensible?", j: 1 },
  { t: "Mum, I'll tell you all about this. If I survive." },
  { t: "The boss is here. I want overtime for this.", j: 1 },
  { t: "No haggling. This one doesn't do discounts." }
];

// Elite spawns (not the first kill).
P.BarkPools.en['BK.elite'] = [
  { t: "The big one's carrying something. Careful." },
  { t: "Elite incoming. This one looks expensive." },
  { t: "This one's huge. Okay, Arda. Stay calm." },
  { t: "Elite zombie. I've got my eye on this one." },
  { t: "Where did all those muscles come from? A gym?", j: 1 }
];

// Low health and healing.
P.BarkPools.en['BK.low'] = [
  { t: "Health's low. Come on, Arda, pull it together." },
  { t: "Even on my last bit of health, I'm walking." },
  { t: "Simit first. Then I'll think about dying.", j: 1 },
  { t: "Blood. Is it ketchup? Genuinely no idea.", j: 1 },
  { t: "At this rate, Mum's getting some very bad news." },
  { t: "Survival is attention, patience and a bit of luck." }
];
P.BarkPools.en['BK.heal'] = [
  { t: "Simit! The real lifesaver." },
  { t: "Feeling better. The simit did its job." },
  { t: "Healed. A coffee would have done it too.", j: 1 },
  { t: "Health's full. Right. Pull yourself together." }
];

// Level-ups, by tier (1-3, 4-6, 7-9, 10+).
P.BarkPools.en['BK.lvlA'] = [
  { t: "Level up! I'm making progress, honestly." },
  { t: "Level up. If only my knees would.", j: 1 },
  { t: "Level up. Still no idea what I'm doing." }
];
P.BarkPools.en['BK.lvlB'] = [
  { t: "Getting stronger. Mum would be proud. For once.", j: 1 },
  { t: "Level! Not muscles yet, but something." },
  { t: "Stronger, and my shoes are finally broken in." }
];
P.BarkPools.en['BK.lvlC'] = [
  { t: "Almost a hero now. Almost.", j: 1 },
  { t: "Good pace. This'll make a story one day." },
  { t: "Level. People are starting to look at me. Keep moving." }
];
P.BarkPools.en['BK.lvlD'] = [
  { t: "That many levels? Who is this guy?", j: 1 },
  { t: "People expect something from me now. Right." },
  { t: "Okay. I can do this. I think I can do this." }
];

// Mods and mastery moves.
P.BarkPools.en['BK.mod'] = [
  { t: "Mod fitted. I'm becoming a mechanic." },
  { t: "This mod makes the blade sharper. Good." },
  { t: "Dad's an engineer. Something must have rubbed off.", j: 1 },
  { t: "Good mod. Didn't read the manual, though." },
  { t: "Tell the Usta I'm fitting the mod. He'll cry.", j: 1 }
];
P.BarkPools.en['BK.mastery'] = [
  { t: "I've seen that move in a video." },
  { t: "Like a pro. Or at least a very determined one.", j: 1 },
  { t: "This move's going to be my signature." },
  { t: "Move's done. Now I want applause." }
];

// Evolutions. The cleaver is the döner knife's last form.
P.BarkPools.en['BK.evo.cleaver'] = [
  { t: "The Usta's Cleaver. The cook's blade is mine now." },
  { t: "Heavy as a cleaver, keen as a chef.", j: 1 },
  { t: "The Usta's Cleaver. I'll give it back. Probably.", j: 1 }
];
P.BarkPools.en['BK.evo.nailstorm'] = [
  { t: "Nail storm! No handyman was ever this fast.", j: 1 },
  { t: "Nail storm! The neighbours are going to complain." },
  { t: "Nail storm. Loud. Very loud. Keep going." }
];
P.BarkPools.en['BK.evo.cluster'] = [
  { t: "Cluster bomb! Not a picnic. A fireworks show.", j: 1 },
  { t: "One blast, then another, then another." },
  { t: "Cluster bomb. Nobody stand in that." }
];
P.BarkPools.en['BK.evo.cyclone'] = [
  { t: "Chain cyclone! My leg didn't get tangled. Lucky.", j: 1 },
  { t: "Cyclone! The bike finally behaved." },
  { t: "Spinning, not falling. Keep spinning." }
];
P.BarkPools.en['BK.evo.finale'] = [
  { t: "Wedding finale! Hope the bride doesn't mind.", j: 1 },
  { t: "Finale! This time the applause is mine." },
  { t: "Sorry, bride. I'm borrowing your finale.", j: 1 }
];
P.BarkPools.en['BK.evo.gen'] = [
  { t: "It evolved. Slightly more evil now.", j: 1 },
  { t: "Evolution done. Now let me evolve too." },
  { t: "It's changed. I'm not sure it's better." }
];

// Cards: one pool per weapon or passive (BK.card.<item>), gen for anything unnamed.
P.BarkPools.en['BK.card.knife'] = [
  { t: "Döner knife. The cook would be proud. Probably.", j: 1 },
  { t: "Knife's back in my hand. Feels right." },
  { t: "The döner knife. Back to basics." }
];
P.BarkPools.en['BK.card.nailgun'] = [
  { t: "Nail gun. Every handyman's dream. And mine." },
  { t: "Nails! I could fix the wardrobe too." },
  { t: "Nail gun. Small, loud, very persuasive.", j: 1 }
];
P.BarkPools.en['BK.card.canister'] = [
  { t: "Gas canister. I know barbecues, but this is a lot.", j: 1 },
  { t: "A canister. Not for a picnic, but it'll do." },
  { t: "Canister. Keep it away from anything lit." }
];
P.BarkPools.en['BK.card.chain'] = [
  { t: "Bike chain. Try not to wrap it round your leg.", j: 1 },
  { t: "Chain's ready. I wish I had my bike." },
  { t: "Bike chain. Swing it. Don't wear it." }
];
P.BarkPools.en['BK.card.sledge'] = [
  { t: "Sledgehammer! Heavy, but fair." },
  { t: "Sledgehammer. Let's go through this door too." },
  { t: "Sledgehammer. Subtle is for other people." }
];
P.BarkPools.en['BK.card.molotov'] = [
  { t: "Fire bottle. Dede never taught me this one." },
  { t: "Bottle in hand. Fire close behind." },
  { t: "Molotov. Lovely. Now don't set myself alight.", j: 1 }
];
P.BarkPools.en['BK.card.fireworks'] = [
  { t: "Fireworks! Left over from a wedding. Congrats, I guess.", j: 1 },
  { t: "Fireworks. A hello to the sky." },
  { t: "Fireworks. Tip: point them away from your face." }
];
P.BarkPools.en['BK.card.cable'] = [
  { t: "Live cable. Warn me before I touch it." },
  { t: "The cable's crackling. Oh, lovely." },
  { t: "Live cable. Fingers off, Arda." }
];
P.BarkPools.en['BK.card.speargun'] = [
  { t: "Speargun! Dede would have loved this one." },
  { t: "Speargun. Works for fishing too." },
  { t: "A speargun. I'm not fishing for compliments.", j: 1 }
];
P.BarkPools.en['BK.card.extinguisher'] = [
  { t: "Fire extinguisher. A weapon and an insurance policy.", j: 1 },
  { t: "Fire extinguisher. This time the fire goes out." },
  { t: "Fire extinguisher. Heavier than it looks." }
];
P.BarkPools.en['BK.card.sawblade'] = [
  { t: "Saw blade. Borrowed from the site. Owner's not noticed.", j: 1 },
  { t: "Teeth, sparks, and nobody gives me grief now." },
  { t: "Saw blade. Teeth on it. Respect it." }
];
P.BarkPools.en['BK.card.manhole'] = [
  { t: "Manhole lid. I'm sure someone wants it back." },
  { t: "Heavy lid, but it bounces. Like a frisbee." },
  { t: "Manhole lid. Heavy. Keep it off my feet." }
];
P.BarkPools.en['BK.card.torch'] = [
  { t: "Blowtorch! Bought it for the barbecue. Plans changed.", j: 1 },
  { t: "Flame's ready. Only snag: I might catch fire too." },
  { t: "Blowtorch. Safe distance, Arda." }
];
P.BarkPools.en['BK.card.cardoor'] = [
  { t: "Car door. Its owner might still be looking for it.", j: 1 },
  { t: "The door goes up, the spit goes back. Fair's fair." },
  { t: "A car door. Shield, weapon, bad idea." }
];
P.BarkPools.en['BK.card.slingshot'] = [
  { t: "Slingshot! My proudest childhood skill." },
  { t: "Marbles bounce, I run. That's the plan." },
  { t: "Slingshot. Childhood skills never really leave you." }
];
P.BarkPools.en['BK.card.chainsaw'] = [
  { t: "Chainsaw. Pulling the cord makes my insides shake." },
  { t: "If it stalls, I wait. Me and the chainsaw both.", j: 1 },
  { t: "Chainsaw. Loud enough to wake the whole block." }
];
P.BarkPools.en['BK.card.shoes'] = [
  { t: "Running shoes! Finally. Where were you yesterday?" },
  { t: "New shoes, new me." },
  { t: "Running shoes. I've been waiting all day for these." }
];
P.BarkPools.en['BK.card.jacket'] = [
  { t: "Leather jacket. Mum hated it, but I'm wearing it.", j: 1 },
  { t: "Jacket on, no coat. Mum will hear about this." },
  { t: "Leather jacket. Bites don't go through leather." }
];
P.BarkPools.en['BK.card.gloves'] = [
  { t: "Work gloves. Now my hands get to be heroes too." },
  { t: "Gloves on. Time for some punching." },
  { t: "Work gloves. Good grip, bad fashion." }
];
P.BarkPools.en['BK.card.energy'] = [
  { t: "Energy drink. It's a lifestyle now." },
  { t: "One more can and I'll be a can myself.", j: 1 },
  { t: "Energy drink. Right. Let's go." }
];
P.BarkPools.en['BK.card.medkit'] = [
  { t: "First-aid kit. Mum always packed one." },
  { t: "Plasters, bandage, and hope. Let's go." },
  { t: "First-aid kit. Steady hands. Let's do this." }
];
P.BarkPools.en['BK.card.nazar'] = [
  { t: "Nazar charm. Staring the zombies down. Good." },
  { t: "Bead's hung up. I'm walking." },
  { t: "Nazar charm. Mum put it in my pocket. Thanks, Mum." }
];
P.BarkPools.en['BK.card.magnet'] = [
  { t: "Magnet. Everything comes to me now." },
  { t: "Magnet! I'll pull in the coins too." },
  { t: "Magnet. Things come to me. Some things, scary ones.", j: 1 }
];
P.BarkPools.en['BK.card.gen'] = [
  { t: "Good pick, Arda. No regrets." },
  { t: "Mum would approve of this pick.", j: 1 },
  { t: "A new power! Things are looking up." }
];

// Hacks: kinds x start / done / fail.
P.BarkPools.en['BK.hack.atm.start'] = [
  { t: "Hooking into the ATM. Time to guess a PIN.", j: 1 },
  { t: "Does 1234 work? Probably not." },
  { t: "ATM. Right. Come on, show me what you've got." }
];
P.BarkPools.en['BK.hack.atm.done'] = [
  { t: "ATM's open. No cash, just a receipt.", j: 1 },
  { t: "ATM's open. Nothing inside. It's staring at me." },
  { t: "ATM's open. Empty, but the receipt is still warm." }
];
P.BarkPools.en['BK.hack.atm.fail'] = [
  { t: "Wrong PIN. One more try, then it locks." },
  { t: "ATM's locked. I'll write to the bank.", j: 1 },
  { t: "Wrong code. Right. Let's not do that again." }
];
P.BarkPools.en['BK.hack.traffic.start'] = [
  { t: "Hacking the traffic lights. Red is mine." },
  { t: "Right, traffic lights. Let's make it red for them." },
  { t: "Hello, traffic light. Give me red." }
];
P.BarkPools.en['BK.hack.traffic.done'] = [
  { t: "Green light! Even Istanbul is surprised.", j: 1 },
  { t: "The lights are for us now. How kind of them." },
  { t: "Green! Everybody look at that. Green." }
];
P.BarkPools.en['BK.hack.traffic.fail'] = [
  { t: "Light's broken. I'll wait on red and try again." },
  { t: "Traffic jam. Just like every morning.", j: 1 },
  { t: "The lights won't listen. Right, plan B." }
];
P.BarkPools.en['BK.hack.booster.start'] = [
  { t: "Connecting to the scooter. The battery's watching me." },
  { t: "Scooter. No helmet. Don't tell Mum.", j: 1 },
  { t: "Scooter's waking up. Come on, come on." }
];
P.BarkPools.en['BK.hack.booster.done'] = [
  { t: "Scooter's on! Battery's lower than I'd like.", j: 1 },
  { t: "Scooter's ready. Time to go a bit faster." },
  { t: "We're moving! Hands on the bars, Arda." }
];
P.BarkPools.en['BK.hack.booster.fail'] = [
  { t: "Scooter's dead. Walking's on me again." },
  { t: "Battery's empty. That's our destiny." },
  { t: "Dead scooter. Back to feet, then." }
];
P.BarkPools.en['BK.hack.shutter.start'] = [
  { t: "Lifting the shutter. It squeaks, so be quiet." },
  { t: "Shutter, shutter... Come on, open up." },
  { t: "Right, shutter. Up you come. Quietly." }
];
P.BarkPools.en['BK.hack.shutter.done'] = [
  { t: "Shutter's up. The rest is up to the zombies." },
  { t: "Shutter's up. The shopkeeper's giving me a nod.", j: 1 },
  { t: "Shutter's up. In we go." }
];
P.BarkPools.en['BK.hack.shutter.fail'] = [
  { t: "Shutter's stuck. Oh, come on. Not now." },
  { t: "The shutter's stubborn. So am I.", j: 1 },
  { t: "Shutter's jammed. Of course it is." }
];
P.BarkPools.en['BK.hack.alarm.start'] = [
  { t: "Silencing the alarm. Beep, beep, beep." },
  { t: "The alarm's going. My heart's keeping time with it." },
  { t: "Right, alarm. Quiet, please, you lovely racket." }
];
P.BarkPools.en['BK.hack.alarm.done'] = [
  { t: "Alarm's quiet. My heart's still shouting." },
  { t: "Silence! My ears finally got some peace." },
  { t: "Alarm's off. Now the zombies are curious.", j: 1 }
];
P.BarkPools.en['BK.hack.alarm.fail'] = [
  { t: "The alarm got louder. Run!" },
  { t: "Wrong button. Everyone heard that one.", j: 1 },
  { t: "Louder. Oh, brilliant. Run, Arda, run." }
];
P.BarkPools.en['BK.hack.tram.start'] = [
  { t: "Starting the tram. I don't even have a licence.", j: 1 },
  { t: "Looking at the Vatman's cab. Here goes." },
  { t: "Right, tram. No licence, no clue. Let's go." }
];
P.BarkPools.en['BK.hack.tram.done'] = [
  { t: "Tram's moving! The Vatman would cry." },
  { t: "Bell rang, tram moved. Brilliant.", j: 1 },
  { t: "Tram's moving. Nobody tell the Vatman." }
];
P.BarkPools.en['BK.hack.tram.fail'] = [
  { t: "The tram won't budge. The rails are tired too.", j: 1 },
  { t: "No key, no ticket, but plenty of hope." },
  { t: "Not moving. The tram isn't either. Brilliant." }
];

// Rescues (someone is saved) and events (start / end).
P.BarkPools.en['BK.rescue'] = [
  { t: "Help's coming! Or a crowd. Hard to say.", j: 1 },
  { t: "Rescuing! Nobody step on anybody." },
  { t: "Rescued! You don't have to thank me." },
  { t: "One more life. Today's going well." },
  { t: "Open the door. I'm human too!" },
  { t: "I helped. Now I want a simit." }
];
P.BarkPools.en['BK.ev.ambush'] = [
  { t: "Ambush! Everyone to the corners. I'll look first." },
  { t: "An ambush. Somebody's been planning. Zombies don't plan." },
  { t: "Ambush! Eyes up, backs to the wall." }
];
P.BarkPools.en['BK.ev.lootRunner'] = [
  { t: "A loot runner! Catch that bag." },
  { t: "Bag guy's running. I'd chase him for a coffee." },
  { t: "Loot runner. Don't let him keep the good bag.", j: 1 }
];
P.BarkPools.en['BK.ev.rescue'] = [
  { t: "Someone's trapped! Come on, give a hand." },
  { t: "A call for help. Anyone else hear that?" },
  { t: "Someone's stuck under there. Lift on three." }
];
P.BarkPools.en['BK.ev.blackout'] = [
  { t: "Power's gone. The phone was already gone.", j: 1 },
  { t: "Pitch dark! Where's my torch?" },
  { t: "Lights are out. Give your eyes a second." }
];
P.BarkPools.en['BK.ev.burningCar'] = [
  { t: "The car's on fire. Nobody inside, right?" },
  { t: "Burning car! Approach slowly, don't let it blow." },
  { t: "The car's alight. Right, nobody stand behind it." }
];
P.BarkPools.en['BK.ev.stampede'] = [
  { t: "Stampede! Run, run!" },
  { t: "A running crowd. This isn't a race, it's an escape!", j: 1 },
  { t: "Here they come. Not a race. A stampede. Move!" }
];
P.BarkPools.en['BK.ev.barricade'] = [
  { t: "A barricade! Someone did a good job. Respect." },
  { t: "Tables and chairs. A homemade castle." },
  { t: "Barricade! Whoever built this, I love you.", j: 1 }
];
P.BarkPools.en['BK.ev.defend'] = [
  { t: "Defend! Everyone hold your spot." },
  { t: "Defence time! I'll be the wall. Your turn.", j: 1 },
  { t: "Hold the line. Nobody goes anywhere." }
];
P.BarkPools.en['BK.evend.ambush'] = [
  { t: "Ambush over. I need a tea. My hands are shaking." },
  { t: "Ambush over. I won't keep anyone waiting again.", j: 1 },
  { t: "It's over. Breathe. Just breathe." }
];
P.BarkPools.en['BK.evend.lootRunner'] = [
  { t: "Loot's ours. My belly's full too." },
  { t: "Bag's ours. The runner's gone." },
  { t: "Got the bag. Didn't get his shoes. Shame.", j: 1 }
];
P.BarkPools.en['BK.evend.rescue'] = [
  { t: "Rescue done. Pulling my heart back together." },
  { t: "We made it! Nobody cry. I'm crying.", j: 1 },
  { t: "Got them out. That's the part that matters." }
];
P.BarkPools.en['BK.evend.blackout'] = [
  { t: "Lights back. We all blinked." },
  { t: "Light's back. Nobody's looking at me. Good.", j: 1 },
  { t: "Lights back on. Nice to see everyone's faces." }
];
P.BarkPools.en['BK.evend.burningCar'] = [
  { t: "Fire's out. The smell is still here." },
  { t: "The car's out. I wish it hadn't burned so much." },
  { t: "Fire's out. I hope nobody was in that car." }
];
P.BarkPools.en['BK.evend.stampede'] = [
  { t: "The herd passed. Pulling myself together." },
  { t: "Run's over. My legs don't know yet.", j: 1 },
  { t: "It's over. Legs, you can stop now." }
];
P.BarkPools.en['BK.evend.barricade'] = [
  { t: "The barricade didn't hold, but it tried hard.", j: 1 },
  { t: "Tables went over. So did the chairs." },
  { t: "Barricade's down. Good effort, furniture.", j: 1 }
];
P.BarkPools.en['BK.evend.defend'] = [
  { t: "Defence over. My knees are shaking." },
  { t: "We held! Now I need to sit down." },
  { t: "We held. I'm sitting down now. Don't argue.", j: 1 }
];

// Signal lost and back (no-signal layer).
P.BarkPools.en['BK.sig.lost'] = [
  { t: "Signal's gone. Just me and the roads." },
  { t: "No signal. The phone's giving me a look.", j: 1 },
  { t: "Signal dropped. Mum's waiting, so am I." },
  { t: "Bars at zero. Nothing to be done." }
];
P.BarkPools.en['BK.sig.back'] = [
  { t: "Signal's back! Mum, can you hear me?" },
  { t: "Signal's back! My phone just cheered.", j: 1 },
  { t: "Signal! Mum first, then me." },
  { t: "Two bars. That's basically a miracle.", j: 1 }
];

// Enemy actions (Arda reacts to what the zombies do).
P.BarkPools.en['BK.act.bruteRoar'] = [
  { t: "It roared! Even the janitors would run.", j: 1 },
  { t: "That roar's not a doorbell. Nobody's answering.", j: 1 },
  { t: "A roar! The neighbours heard that, I think." },
  { t: "That roar made my ears hurt." }
];
P.BarkPools.en['BK.act.bruteCharge'] = [
  { t: "Charge! Time to run this time." },
  { t: "It's speeding up. Doing some cardio, I guess.", j: 1 },
  { t: "Run! Run! I'm already running." },
  { t: "It's coming at me. Shoes ready?", j: 1 }
];
P.BarkPools.en['BK.act.spit'] = [
  { t: "Spit! Look down, down!" },
  { t: "Spit incoming! There goes the jacket.", j: 1 },
  { t: "Acid's raining. I wish I had a car door." },
  { t: "The spit on the ground is bubbling. Keep away." }
];
P.BarkPools.en['BK.act.bloaterSwell'] = [
  { t: "It's swelling! Everybody back!" },
  { t: "It's swelling. Not a good sign, that." },
  { t: "Like a balloon! Except balloons don't do this.", j: 1 },
  { t: "Bloated one! Stay away, stay away." }
];
P.BarkPools.en['BK.act.summon'] = [
  { t: "It summoned! It's inviting its friends.", j: 1 },
  { t: "Sent out invitations. I didn't RSVP." },
  { t: "Newcomers. Who are these lot?" },
  { t: "A call went out. I'm declining the invitation.", j: 1 }
];
P.BarkPools.en['BK.act.bossSlam'] = [
  { t: "Ground slam! Lifting my feet." },
  { t: "Slam! The ground just became my enemy.", j: 1 },
  { t: "The ground thumped. Even the ground is tired." },
  { t: "Dust! Visibility zero, heart at a hundred.", j: 1 }
];

// Ultimates, dash, near misses, nazar charm, frenzy.
P.BarkPools.en['BK.ult'] = [
  { t: "Last move! I'm still here." },
  { t: "Ultimate mode! Right, let's go." },
  { t: "Mega strike. Nobody messes with me now." },
  { t: "Star power! This time I won too." },
  { t: "I gave it everything. Your turn now.", j: 1 },
  { t: "Final move done. Breathe, Arda." }
];
P.BarkPools.en['BK.ultr'] = [
  { t: "Ready! Go on, press it." },
  { t: "Final move's ready. I'm getting excited, honestly." },
  { t: "Full charge. Could blow up the whole street.", j: 1 }
];
P.BarkPools.en['BK.dash'] = [
  { t: "Dashed! Speed is a personality too." },
  { t: "Dashed, ran, won." },
  { t: "Mila would have run faster.", j: 1 },
  { t: "Sprint! My coach would be proud.", j: 1 },
  { t: "My feet flew. My head stayed put." }
];
P.BarkPools.en['BK.near'] = [
  { t: "Whoa! My hair just moved.", j: 1 },
  { t: "Okay, okay. That was close." },
  { t: "It didn't have to get that close." },
  { t: "My heart dropped somewhere." },
  { t: "By a hair. Literally, a hair.", j: 1 }
];
P.BarkPools.en['BK.nazar'] = [
  { t: "The nazar charm saved me that time." },
  { t: "The bead took the hit for me.", j: 1 },
  { t: "Thanks, bead. Not joking." }
];
P.BarkPools.en['BK.frenzy'] = [
  { t: "I've gone wild! Hold on." },
  { t: "Mode on. Arda 2.0.", j: 1 },
  { t: "Blood, adrenaline. I'm here." }
];

// Idle, standing still, and a zombie very close (ambient).
P.BarkPools.en['BK.idle'] = [
  { t: "What am I waiting for? A bus?", j: 1 },
  { t: "Come on, Arda. There's no escalator here." },
  { t: "I stopped, and the walk stopped too." },
  { t: "Let me catch my breath. Then we go." },
  { t: "This silence is wearing me out too." },
  { t: "I've started talking to myself. Heads up.", j: 1 },
  { t: "Nothing's coming. Good. Let's keep it that way." },
  { t: "Right. Breathe. Look at the sky for a second." }
];
P.BarkPools.en['BK.still'] = [
  { t: "Even my shoes are annoyed with me." },
  { t: "I'm standing still. It's a strategy.", j: 1 },
  { t: "Standing still is part of walking too." },
  { t: "My heart's running. My feet are resting." },
  { t: "Right, this time I'm starting. Really.", j: 1 },
  { t: "Walk or rest? I can't decide." },
  { t: "Two seconds. Then I'm moving. Promise." },
  { t: "Stopping for a second, just to feel my legs." }
];
P.BarkPools.en['BK.close'] = [
  { t: "Too close! Could you hold your breath? Rude.", j: 1 },
  { t: "Don't come so close. I've got personal space." },
  { t: "Even the smell is slowing me down." },
  { t: "Backing off. It's a tactic." },
  { t: "This distance is too much for me, mate.", j: 1 },
  { t: "Close, but it won't reach me. I bet." },
  { t: "Step back. Step back. Good. Stay there." },
  { t: "Nice and slow. Nice and slow." }
];

// Talking to a zombie: zq (Arda), zr (its groan), zreact (Arda again). See the header: picked independently.
P.BarkPools.en['BK.zq'] = [
  { t: "Sorry, abi. Did I step on your foot?", j: 1 },
  { t: "Stop staring. I'm getting shy." },
  { t: "What? You've got something to say?" },
  { t: "Your mouth's open. Going to say something?" },
  { t: "Say something, or I will, and it'll be worse.", j: 1 },
  { t: "You want a head? Not today, sorry.", j: 1 },
  { t: "Where are you headed at this hour?" },
  { t: "Can I make a suggestion? Turn around.", j: 1 },
  { t: "What's your name? No? Not even a first name?" },
  { t: "This side's closed. You know that." },
  { t: "I've had a bad day too. Go on, move." },
  { t: "We didn't finish talking. Don't be sad." },
  { t: "You talk this time. I'll listen." },
  { t: "Walking too? Travel buddy?", j: 1 }
];
P.BarkPools.en['BK.zr'] = [
  { t: "Hhhnnrrgh." },
  { t: "Grrrraaahh." },
  { t: "Mmmhrrgh..." },
  { t: "Hrrrgh?" },
  { t: "Aaaarrrgh." },
  { t: "Hhhhrrgh!" },
  { t: "Gurrrrgh..." }
];
P.BarkPools.en['BK.zreact'] = [
  { t: "Fair enough. That's what I thought too." },
  { t: "Okay, okay. I hear you. I'm leaving." },
  { t: "I think I understood that. None of it.", j: 1 },
  { t: "That went a bit one-sided, didn't it?", j: 1 },
  { t: "Hmm. Agreed. Now put your head down." },
  { t: "Noted. I'll count that as an answer.", j: 1 },
  { t: "Ugh. You're bored too, clearly." },
  { t: "You're lonely too. I get it, mate." },
  { t: "Right, conversation's over. Thanks, though." },
  { t: "How am I supposed to read that?", j: 1 }
];

// No signal: talking to himself (self), Mum in his head (mom), Dad in his head (dad).
P.BarkPools.en['BK.self'] = [
  { t: "Okay, Arda. Make a plan. Plan: walk.", j: 1 },
  { t: "No signal, no chat. Guess you're the chat now.", j: 1 },
  { t: "Thinking out loud. Nobody's listening, so fine." },
  { t: "Rule four: don't swear at your own feet. They're trying.", j: 1 },
  { t: "Stay calm. Panic burns energy. So does walking." },
  { t: "Half a dürüm in my bag. Honestly, that's my life.", j: 1 },
  { t: "When this is over, I'm telling nobody about this." },
  { t: "Is there tea in Ataköy? Or am I walking for nothing?", j: 1 },
  { t: "My feet are tired. Are they? Yes. Yes, they are." },
  { t: "Nobody around. Just me. That'll have to do." },
  { t: "They say don't wake a sleeping zombie. I'll stay up." },
  { t: "A radio would be nice. Or Mum's voice." },
  { t: "Phone's at 12%. It'll die before I do. Probably.", j: 1 },
  { t: "Same street, same zombies, different doors." },
  { t: "Counting my steps. Four thousand eight hundred." },
  { t: "Is this Beyoğlu or Fatih? No idea either." },
  { t: "I say sorry. They say 'Hhhrrgh'. We're not getting along.", j: 1 },
  { t: "Come on, Arda, get up. Nobody's coming to lift you." },
  { t: "One drop of water would feel like a luxury." },
  { t: "I wonder if Dede's fishing right now." },
  { t: "In this series, who am I? Lead or extra?" },
  { t: "If Mum saw me now, first thing she'd say: 'Shoes?'", j: 1 }
];
P.BarkPools.en['BK.mom'] = [
  { t: "Mum would be asking if I've got a jacket on." },
  { t: "Mum would ask if I've eaten. I'd say dürüm.", j: 1 },
  { t: "If Mum saw this walk, she'd say take the car." },
  { t: "Mum would say tie your shoes. Tying them, Mum.", j: 1 },
  { t: "Mum would cry first, then serve me rice.", j: 1 },
  { t: "Mum would say lock the door. There's no lock now." },
  { t: "Mum, I can't send you a dürüm. I'm thinking of you." },
  { t: "Mum would say don't talk nonsense. It's quiet, though." }
];
P.BarkPools.en['BK.dad'] = [
  { t: "Dad would draw a chart for this.", j: 1 },
  { t: "Dad always said measure twice. I'm running first.", j: 1 },
  { t: "Dad always had a pencil. I've got a knife." },
  { t: "Dad always tried to fix me. Still working on it." },
  { t: "Dad always said everyone wins. Except zombies." },
  { t: "Dad always said be patient. I'm trying, Dad." },
  { t: "Dad, what did you see when you went north?" },
  { t: "Dad's an engineer. I need a plan. Ugh." }
];

// Hoods. One pool per stage: stage 1 is the hood entry, stages 2-4 are landmarks, stage 5 is the boss arena.
// H01 İstiklal
P.BarkPools.en['BK.hd01.1'] = [
  { t: "İstiklal at dusk. The tourists left. The zombies didn't." },
  { t: "The Tünel's shut. From here it's on foot." },
  { t: "The simit cart's still open. Nobody's buying.", j: 1 }
];
P.BarkPools.en['BK.hd01.2'] = [
  { t: "Shops still lit. Somebody's expecting customers.", j: 1 },
  { t: "The arcade's full of people who used to be shoppers." },
  { t: "Dusk turning to night. Keep the windows at my back." }
];
P.BarkPools.en['BK.hd01.3'] = [
  { t: "Streetlights going out one by one. Stay close." },
  { t: "Tram stop. Something's waiting in the dark." },
  { t: "Every streetlight that goes out, something gets closer." }
];
P.BarkPools.en['BK.hd01.4'] = [
  { t: "Wires overhead, rain coming down. Stay off the rails." },
  { t: "Wet tram lines. Zombies in the drizzle. Lovely." },
  { t: "Under the wires. That humming is not a good sign." }
];
P.BarkPools.en['BK.hd01.5'] = [
  { t: "The tram's on its side. The Vatman's still in it, I think.", j: 1 },
  { t: "Fog in the square. Derailed tram. Nowhere to run." },
  { t: "Whatever climbs out of that tram, don't let it." }
];
// H02 Galata
P.BarkPools.en['BK.hd02.1'] = [
  { t: "Galata's stairs. My legs have opinions about these." },
  { t: "Cobbled steps, lanterns coming on. Hold the rail." },
  { t: "Every one of these stairs is steeper than the last." }
];
P.BarkPools.en['BK.hd02.2'] = [
  { t: "Tavla boards left out. Somebody left mid-game." },
  { t: "A saz on a radio somewhere. Nobody's dancing." },
  { t: "Tables still set. Nobody came back for their drinks.", j: 1 }
];
P.BarkPools.en['BK.hd02.3'] = [
  { t: "The guide's umbrella's still up. Still leading.", j: 1 },
  { t: "The tour group has finally stopped listening." },
  { t: "Wind's up. The whole group is following that umbrella." }
];
P.BarkPools.en['BK.hd02.4'] = [
  { t: "They're coming down the stairs. Don't look down." },
  { t: "Lanterns swinging, a horde coming down. Nice view.", j: 1 },
  { t: "Down the stairs, all at once. Nobody overtake." }
];
P.BarkPools.en['BK.hd02.5'] = [
  { t: "The tower's behind them. Mum said don't climb it." },
  { t: "Top of the hill. Cold wind. Nowhere left to go." },
  { t: "Tower behind them, flag in front of them. Right." }
];
// H03 Karaköy
P.BarkPools.en['BK.hd03.1'] = [
  { t: "Karaköy. The café's shut. Cakes in the window." },
  { t: "Espresso machine still hissing. Nobody to serve.", j: 1 },
  { t: "Coffee smell and gulls. Nobody to order from." }
];
P.BarkPools.en['BK.hd03.2'] = [
  { t: "Pier boards creak. The wind's coming off the water." },
  { t: "Sea wind on the pier. My hair's given up." },
  { t: "Keep to the middle of the boards. The edges are loose." }
];
P.BarkPools.en['BK.hd03.3'] = [
  { t: "Horns. A wedding convoy? Please, not the bride.", j: 1 },
  { t: "Paper lanterns swaying. Somebody's still celebrating." },
  { t: "The convoy's coming. Off the road, Arda. Now." }
];
P.BarkPools.en['BK.hd03.4'] = [
  { t: "Gas tanks by the café. Pop one, they all go." },
  { t: "Bloaters by the gas tanks. Brilliant planning.", j: 1 },
  { t: "One pops and the lot goes. Keep your distance." }
];
P.BarkPools.en['BK.hd03.5'] = [
  { t: "Warm lamps in the café. The bride's standing in the middle." },
  { t: "The bride's still in her dress. Still holding the bouquet." },
  { t: "Café, lamps, bride. Long night ahead." }
];
// H04 Galata Bridge
P.BarkPools.en['BK.hd04.1'] = [
  { t: "Galata Bridge. Two decks, and lines on both." },
  { t: "Upper deck. Anglers still at the rail, reels clicking." },
  { t: "The bridge, and its fishing lines. Watch your feet." }
];
P.BarkPools.en['BK.hd04.2'] = [
  { t: "Fog's coming in off the Horn. Can't see the end." },
  { t: "Rails lined with rods. Nobody's caught anything.", j: 1 },
  { t: "Fog's rolling in. Good for hiding, bad for everything else." }
];
P.BarkPools.en['BK.hd04.3'] = [
  { t: "Lines across the deck. Every step is a trap." },
  { t: "Fishing lines everywhere. I'm not a fish, mate.", j: 1 },
  { t: "Hooks at head height. Duck. Duck again." }
];
P.BarkPools.en['BK.hd04.4'] = [
  { t: "A horn in the fog. Horde coming from both ends." },
  { t: "Both ends of the bridge. Not great, bridge." },
  { t: "Fog, horns, zombies on both sides. Lovely." }
];
P.BarkPools.en['BK.hd04.5'] = [
  { t: "Lower deck. Restaurants still open. For nobody.", j: 1 },
  { t: "Half of the bridge done. Half to go." },
  { t: "The fisherman's already got his line in." }
];
// H05 Eminönü
P.BarkPools.en['BK.hd05.1'] = [
  { t: "Eminönü. Spice, salt and fish. And zombies." },
  { t: "The fish-bread boats are still tied up. Empty." },
  { t: "Ferry horn somewhere. Nobody's going anywhere." }
];
P.BarkPools.en['BK.hd05.2'] = [
  { t: "Sumac haze in the aisles. Can't see my own shoes.", j: 1 },
  { t: "Spice sacks stacked like pyramids. Keep walking." },
  { t: "Breathing through my sleeve now. Very stylish." }
];
P.BarkPools.en['BK.hd05.3'] = [
  { t: "Pepper cloud. Eyes shut, breathe through your sleeve." },
  { t: "Spice clouds drifting through the aisles. Pretty, honestly." },
  { t: "The zombies are sneezing. Hard to sneak up on anyone.", j: 1 }
];
P.BarkPools.en['BK.hd05.4'] = [
  { t: "The pier's tilting. Everything's sliding to the water." },
  { t: "The pier's tilting. Swimming wasn't in my plans.", j: 1 },
  { t: "Careful. The zombies are sliding past me. Into the sea." }
];
P.BarkPools.en['BK.hd05.5'] = [
  { t: "The boat's lights are on. The captain's waiting." },
  { t: "The captain's on deck. He's had enough of the sea." },
  { t: "Boat lights in the dark. I've decided I don't like boats." }
];
// H06 Sirkeci
P.BarkPools.en['BK.hd06.1'] = [
  { t: "Sirkeci. The old clock says a quarter past nothing.", j: 1 },
  { t: "The forecourt's quiet. Too quiet for a station." },
  { t: "The station's still here. The trains aren't." }
];
P.BarkPools.en['BK.hd06.2'] = [
  { t: "Benches everywhere. Nobody's sitting on them." },
  { t: "Every footstep echoes like an announcement." },
  { t: "One bulb flickering over the concourse. Great." }
];
P.BarkPools.en['BK.hd06.3'] = [
  { t: "Turnstiles. Go under, over, or through. Pick one." },
  { t: "The lights flicker. Don't look straight at them." },
  { t: "Turnstile's stuck. Turnstiles never work for me.", j: 1 }
];
P.BarkPools.en['BK.hd06.4'] = [
  { t: "A queue. Of course there's a queue.", j: 1 },
  { t: "They're in a line. Patient, which is more than the trains." },
  { t: "The queue's moving. For once, it isn't us." }
];
P.BarkPools.en['BK.hd06.5'] = [
  { t: "Departure board's blank. Nothing's leaving." },
  { t: "The clock stopped. Somewhere, a train is late.", j: 1 },
  { t: "Departure board says 'delayed'. Thanks, that's helpful." }
];
// H07 Kapalıçarşı
P.BarkPools.en['BK.hd07.1'] = [
  { t: "Kapalıçarşı. Haggling is the only thing I'm good at.", j: 1 },
  { t: "Kilims on both sides, and nobody behind the counters." },
  { t: "The lanterns are still lit. Somebody left them on." }
];
P.BarkPools.en['BK.hd07.2'] = [
  { t: "Every lane looks the same. No idea where I am." },
  { t: "Brass lanterns and dust. Keep the shutters on your left." },
  { t: "Every counter has a kilim, and every kilim has a zombie.", j: 1 }
];
P.BarkPools.en['BK.hd07.3'] = [
  { t: "A shutter just came down behind me. Don't stop." },
  { t: "The shutters are closing. Okay, Arda, keep moving." },
  { t: "Left, right, left, my knee, left. Maze work." }
];
P.BarkPools.en['BK.hd07.4'] = [
  { t: "'Do not open the door.' Noted. Too late, obviously.", j: 1 },
  { t: "Counters are chokepoints. Don't get pinned." },
  { t: "The sign says don't open. Nobody reads signs at night." }
];
P.BarkPools.en['BK.hd07.5'] = [
  { t: "Crossroads, lanterns, and something rolled in a carpet." },
  { t: "The carpet's moving. Someone's in there, I think." },
  { t: "Crossroads. Lanterns still lit. Good." }
];
// H08 Beyazıt
P.BarkPools.en['BK.hd08.1'] = [
  { t: "Beyazıt. Bookstalls, pigeons, and nobody reading." },
  { t: "Crates of books, every one of them left open." },
  { t: "Second-hand books, first-hand zombies.", j: 1 }
];
P.BarkPools.en['BK.hd08.2'] = [
  { t: "Pigeons everywhere. Like they've been waiting." },
  { t: "The pigeons clap their wings. Almost applauding." },
  { t: "Pigeons on every roof. They know something." }
];
P.BarkPools.en['BK.hd08.3'] = [
  { t: "A flock blocking the lane. Politely, they won't move.", j: 1 },
  { t: "Pigeons block the lane. I'll go round. Gently." },
  { t: "Don't spook the pigeons. They're doing their best." }
];
P.BarkPools.en['BK.hd08.4'] = [
  { t: "Bookstalls on fire. Every book I didn't read.", j: 1 },
  { t: "Smoke from the bookstalls. Please, not the Sahaflar." },
  { t: "Bookstall smoke. Covering my face with my sleeve." }
];
P.BarkPools.en['BK.hd08.5'] = [
  { t: "One lamp left on in the square. Everything else is dark." },
  { t: "The Pigeon Man is still feeding his birds. Respect." },
  { t: "One lamp, a lot of birds, and one very hungry man." }
];
// H09 Kumkapı
P.BarkPools.en['BK.hd09.1'] = [
  { t: "Kumkapı. Fish on ice and nobody buying." },
  { t: "Red and gold lanterns. Pretty, if you ignore the rest." },
  { t: "Every table's laid. Nobody's sitting at them." }
];
P.BarkPools.en['BK.hd09.2'] = [
  { t: "Sea mist rolling in off the quay. Visibility's bad." },
  { t: "The sea smells fine. Everything else smells of fish.", j: 1 },
  { t: "Rods along the quay wall. Nobody's watching them." }
];
P.BarkPools.en['BK.hd09.3'] = [
  { t: "The ice cart. Protect it, Arda. Protect the ice." },
  { t: "Ice melting, cart rolling, zombies closing in." },
  { t: "Hold the ice cart. Keep it cold, keep it standing." }
];
P.BarkPools.en['BK.hd09.4'] = [
  { t: "The band's looping the same tune. Make it stop.", j: 1 },
  { t: "A band in the corner, playing the same bit again." },
  { t: "Someone's still playing. I can't get the tune out." }
];
P.BarkPools.en['BK.hd09.5'] = [
  { t: "Quay's end. Nowhere to go but the water." },
  { t: "The Fish Porter's carrying a crate. Probably me next.", j: 1 },
  { t: "Dead end of the quay. Turn around, carefully." }
];
// H10 Laleli
P.BarkPools.en['BK.hd10.1'] = [
  { t: "Laleli at night. Sodium lamps and a thousand mannequins." },
  { t: "Cartons stacked on the pavement. Everyone's stock." },
  { t: "Every window is full of people who don't move.", j: 1 }
];
P.BarkPools.en['BK.hd10.2'] = [
  { t: "Cartons stacked to the ceiling. Could be a fort." },
  { t: "Everything looks orange in this light. Like a bad photo." },
  { t: "Hide behind a carton, keep quiet, don't breathe." }
];
P.BarkPools.en['BK.hd10.3'] = [
  { t: "The mannequins are moving. Some of them, anyway.", j: 1 },
  { t: "The window display just turned its head." },
  { t: "Wait. Did that mannequin just blink?" }
];
P.BarkPools.en['BK.hd10.4'] = [
  { t: "Fabric rolls everywhere. Anything could be behind them." },
  { t: "The rolls are hiding something. Don't get close." },
  { t: "Fabric rolls. Something behind each one. Brilliant.", j: 1 }
];
P.BarkPools.en['BK.hd10.5'] = [
  { t: "Everything's on sale. Including me.", j: 1 },
  { t: "The Wholesaler's yard. Bulk orders, no refunds." },
  { t: "Crate yard's quiet. Too quiet for a wholesale yard." }
];
// H11 Aksaray
P.BarkPools.en['BK.hd11.1'] = [
  { t: "Aksaray. Minibuses everywhere and none of them moving." },
  { t: "Dolmuş headlights still on. Nobody's driving." },
  { t: "Bus shelter's still got a timetable on it. Bit optimistic.", j: 1 }
];
P.BarkPools.en['BK.hd11.2'] = [
  { t: "The plaza's quiet, bar one horn, somewhere." },
  { t: "A horn, then another. Nobody's getting a seat." },
  { t: "Cones, a plaza, and a driver waving me over. No.", j: 1 }
];
P.BarkPools.en['BK.hd11.3'] = [
  { t: "Minibuses jammed in every lane. Nothing's getting through." },
  { t: "Lanes full of minibuses. Walking is faster, honestly.", j: 1 },
  { t: "Engines off, doors open. Something's in each one." }
];
P.BarkPools.en['BK.hd11.4'] = [
  { t: "Bakery's closed, but the bread smell's still here." },
  { t: "A closed bakery. Warm enough to sit near for a minute." },
  { t: "The pide oven's still warm. Five minutes, then go." }
];
P.BarkPools.en['BK.hd11.5'] = [
  { t: "Junction. The driver wants a fare. Says he'll wait." },
  { t: "The horn's a signal. Something's coming through." },
  { t: "The driver's hooting. Right, we're coming, mate.", j: 1 }
];

// H12 Yenikapı
P.BarkPools.en['BK.hd12.1'] = [
  { t: "Yenikapı. Underground, grey light, grey phone." },
  { t: "The escalator's stopped halfway. Like the rest of my day.", j: 1 },
  { t: "The steps go down. I don't love that." }
];
P.BarkPools.en['BK.hd12.2'] = [
  { t: "Torch only. My eyes are doing the rest." },
  { t: "Tiled walls, one torch, and a lot of echo." },
  { t: "The hall's huge. The torch isn't." }
];
P.BarkPools.en['BK.hd12.3'] = [
  { t: "Power's cut. The gates are clicking open for nobody." },
  { t: "No power. Gates shut. Everything's quiet, then not." },
  { t: "The lights died, and the dark started breathing." }
];
P.BarkPools.en['BK.hd12.4'] = [
  { t: "Stairs full of them. Nobody's taking the escalator.", j: 1 },
  { t: "Keep to the wall on the stairs. Hold the rail." },
  { t: "Stairs down, and every step has someone on it." }
];
P.BarkPools.en['BK.hd12.5'] = [
  { t: "Everyone on this platform wants the same train.", j: 1 },
  { t: "Platform's packed. Let's hope that's the last train." },
  { t: "The crowd's on the platform. Last stop, then." }
];
// H13 Samatya
P.BarkPools.en['BK.hd13.1'] = [
  { t: "Samatya before dawn. The sea's quiet. The zombies aren't." },
  { t: "The promenade's empty. Mostly empty.", j: 1 },
  { t: "Nobody on the sea wall. Nobody on the benches." }
];
P.BarkPools.en['BK.hd13.2'] = [
  { t: "The blankets are laid out. Someone meant to stay." },
  { t: "Sunrise coming. Blankets everywhere. Watch your feet." },
  { t: "You can't see what's under the blankets. Keep your distance." }
];
P.BarkPools.en['BK.hd13.3'] = [
  { t: "A cat's hissing. Something's under a blanket." },
  { t: "The cats are hissing at everything. Good. I trust cats now.", j: 1 },
  { t: "Sun's coming up. The cats have been right all night." }
];
P.BarkPools.en['BK.hd13.4'] = [
  { t: "Sea wall. Push them in, and they just drift off." },
  { t: "Push them over the wall. The sea doesn't want them." },
  { t: "Sea wall. Hit them hard, and off they go." }
];
P.BarkPools.en['BK.hd13.5'] = [
  { t: "Golden hour, and smoke from the grill everywhere." },
  { t: "Smoke off the grill. This isn't a barbecue, is it?", j: 1 },
  { t: "Golden light and grill smoke. Lovely, if it weren't this." }
];
// H14 Yedikule
P.BarkPools.en['BK.hd14.1'] = [
  { t: "Yedikule's walls. They held once. Let's hope again." },
  { t: "On top of the wall. Narrow, but it's the high ground." },
  { t: "The walls are still standing. I'm not sure about me.", j: 1 }
];
P.BarkPools.en['BK.hd14.2'] = [
  { t: "Gardens inside the walls. Somebody tended these." },
  { t: "Tea garden. No tea, plenty of tables." },
  { t: "Gardeners who've stopped gardening. Sad, really." }
];
P.BarkPools.en['BK.hd14.3'] = [
  { t: "Three keys. Please let them be on the same person.", j: 1 },
  { t: "Right, keys. I'm looking for three of them." },
  { t: "The keys are on him. He won't give them up." }
];
P.BarkPools.en['BK.hd14.4'] = [
  { t: "Tables blocking the lane. I'll go round them." },
  { t: "Tea tables block the path. Brilliant planning." },
  { t: "Ivy's moving. Not the wind, something else." }
];
P.BarkPools.en['BK.hd14.5'] = [
  { t: "The gatehouse. Keys on a belt, keys on a hook." },
  { t: "Gatehouse ahead. Sun behind it. Great, a silhouette.", j: 1 },
  { t: "Gatehouse, morning light, and a man with keys." }
];
// H15 Kazlıçeşme
P.BarkPools.en['BK.hd15.1'] = [
  { t: "Kazlıçeşme. Lawns, sprinklers and sun. Too nice.", j: 1 },
  { t: "Seaside path in the sun. Peaceful, if you ignore the rest." },
  { t: "Keep to the path, not the sprinklers." }
];
P.BarkPools.en['BK.hd15.2'] = [
  { t: "Lawns are green. The zombies on them are greener.", j: 1 },
  { t: "The picnic blankets are still out. Nobody's picnicking." },
  { t: "The grass is wet. Watch your feet." }
];
P.BarkPools.en['BK.hd15.3'] = [
  { t: "Sprinklers on. Hoses across the path. Watch the wet." },
  { t: "The sprinkler lanes are slippery. Walk on the dry bits." },
  { t: "Wet ground, live cable. Nobody panic.", j: 1 }
];
P.BarkPools.en['BK.hd15.4'] = [
  { t: "Joggers in a pack. I'd love to keep up with them." },
  { t: "They're running in a line. Lovely, really." },
  { t: "Joggers coming in a pack. Brilliant." }
];
P.BarkPools.en['BK.hd15.5'] = [
  { t: "The hose yard. Hoses everywhere. Anyone know the way?" },
  { t: "The hose man's on the lawn. Yep, figures.", j: 1 },
  { t: "Hoses coiled like snakes. Don't step on them." }
];
// H16 Zeytinburnu
P.BarkPools.en['BK.hd16.1'] = [
  { t: "Zeytinburnu. Drums in every colour, nobody painting.", j: 1 },
  { t: "The yard gate's open. The shift's supposed to be over." },
  { t: "Textile yards. Hot, hazy, and full of drums." }
];
P.BarkPools.en['BK.hd16.2'] = [
  { t: "Bales of cloth. Good cover, bad footing." },
  { t: "Something's moving between the bales." },
  { t: "I'd hide in a bale, but I'd sneeze." }
];
P.BarkPools.en['BK.hd16.3'] = [
  { t: "The conveyor's moving. So are they. Stay off it." },
  { t: "Zombies riding the conveyor. Commute made easy.", j: 1 },
  { t: "Conveyor belt. I'd rather not be the next thing on it." }
];
P.BarkPools.en['BK.hd16.4'] = [
  { t: "Drums in every colour. Don't shoot the teal one." },
  { t: "One drum goes, and the whole row goes. Keep back." },
  { t: "Keep away from the magenta ones. They look ready." }
];
P.BarkPools.en['BK.hd16.5'] = [
  { t: "The foreman's still on shift. Overtime, anybody?", j: 1 },
  { t: "Haze in the yard. The foreman's coming through it." },
  { t: "Nobody's clocking out in this yard." }
];
// H17 Bakırköy Çarşı
P.BarkPools.en['BK.hd17.1'] = [
  { t: "Bakırköy arcade. Half the shops are shut." },
  { t: "Dust in the light from the skylight. No shoppers." },
  { t: "Half the shops are shut. Good luck to the other half.", j: 1 }
];
P.BarkPools.en['BK.hd17.2'] = [
  { t: "Shops, shutters, shoppers. Mostly shutters." },
  { t: "Dust falling through the skylight like snow." },
  { t: "A shopping trolley squeaking. Who's pushing it?" }
];
P.BarkPools.en['BK.hd17.3'] = [
  { t: "School bell. Every time it rings, they come." },
  { t: "The bell's ringing. I know that one. Run.", j: 1 },
  { t: "The school bell. Never liked it. Still doesn't like me." }
];
P.BarkPools.en['BK.hd17.4'] = [
  { t: "Gates are shutting. Go, go, go." },
  { t: "The gates are closing. Don't be the last one through." },
  { t: "Gate's coming down. Not waiting for the next bell.", j: 1 }
];
P.BarkPools.en['BK.hd17.5'] = [
  { t: "The principal's door. Knock first. Sort of.", j: 1 },
  { t: "Last time I was sent here, I was in trouble." },
  { t: "His office door. Never thought I'd see it like this." }
];
// H18 Bakırköy Sahil
P.BarkPools.en['BK.hd18.1'] = [
  { t: "Bakırköy shore. Palms, bikes, and an ice-cream bell." },
  { t: "Promenade's empty, bar one ice-cream bell ringing." },
  { t: "Palms, bike lane, sea. Nice view for a last walk." }
];
P.BarkPools.en['BK.hd18.2'] = [
  { t: "Benches all facing the sea. Nobody on any of them." },
  { t: "Picnic bags on the benches. Nobody's coming back." },
  { t: "The benches are still waiting for their people." }
];
P.BarkPools.en['BK.hd18.3'] = [
  { t: "The bell goes, and they come. Learn the rhythm." },
  { t: "Bell's ringing again. That's my cue, apparently." },
  { t: "Every time the bell rings, something's coming. Breathe." }
];
P.BarkPools.en['BK.hd18.4'] = [
  { t: "They're coming down the bike lane. The wrong way.", j: 1 },
  { t: "The bike lane's full. Nobody's got right of way." },
  { t: "Bike lane horde. Right, let's not get run over." }
];
P.BarkPools.en['BK.hd18.5'] = [
  { t: "The cart's puffing out a cold cloud. Lovely." },
  { t: "Free ice cream, he says. Don't ask why it's free.", j: 1 },
  { t: "A cold cloud from the ice-cream cart. Sure. Why not." }
];
// H19 Ataköy Marina
P.BarkPools.en['BK.hd19.1'] = [
  { t: "Ataköy marina at dawn. Masts, boats, zombie sailors.", j: 1 },
  { t: "Masts clinking in the wind. The sea's the calm bit." },
  { t: "Dawn on the marina. The boats are still tied up." }
];
P.BarkPools.en['BK.hd19.2'] = [
  { t: "The pontoon's tilting. I'm not good on boats." },
  { t: "The boards sway. I'm getting seasick." },
  { t: "Pontoons under my feet. Keep the middle, keep balance." }
];
P.BarkPools.en['BK.hd19.3'] = [
  { t: "A zombie just fell in. Splash. Goodbye.", j: 1 },
  { t: "Halfway across. Halfway is the hardest bit." },
  { t: "Don't look down at the water. It looks back." }
];
P.BarkPools.en['BK.hd19.4'] = [
  { t: "Rope nets everywhere. Zombies stuck in them." },
  { t: "The ropes are catching them. Thank you, ropes.", j: 1 },
  { t: "Nets of rope. Mind the ones still moving." }
];
P.BarkPools.en['BK.hd19.5'] = [
  { t: "The yacht's got its lights on. Hello?" },
  { t: "The yacht owner's on deck. Looks like a bad mood." },
  { t: "The yacht's still there. The crew, not so much.", j: 1 }
];
// H20 Ataköy
P.BarkPools.en['BK.hd20.1'] = [
  { t: "Home. The booth light's on. Someone's in there." },
  { t: "Ataköy. Beige walls, blue shutters. Still home." },
  { t: "The lobby. The porter's booth light is on." }
];
P.BarkPools.en['BK.hd20.2'] = [
  { t: "Stairwell's quiet. Same smell it always had." },
  { t: "Laundry lines. Mum would still say wear a jacket.", j: 1 },
  { t: "Stairs to our flat. I can take them. Probably." }
];
P.BarkPools.en['BK.hd20.3'] = [
  { t: "Stairwell's full. I know every step on this one." },
  { t: "Ahmet Abi used to make me sit on the bottom step." },
  { t: "Don't stop on the landing. Keep climbing, Arda." }
];
P.BarkPools.en['BK.hd20.4'] = [
  { t: "Courtyard. Washing lines. Somebody's still got socks out." },
  { t: "Courtyard. Washing out, nobody to bring it in." },
  { t: "The keys are somewhere out here. Ahmet Abi would know." }
];
P.BarkPools.en['BK.hd20.5'] = [
  { t: "Ahmet Abi. Take your bread, son. Please." },
  { t: "Courtyard, morning. I really don't want to do this." },
  { t: "Ahmet Abi. I'm not going before you say 'take your bread.'" }
];
// Lane A environment barks (AUDIT-6 A2, A4, A5): native English, plain first, jokes rare. Keys come from view/env-fx.js.
P.BarkPools.en['BK.env.explode'] = [
  { t: 'Down! Get down!' },
  { t: 'Ears ringing. Still breathing. Good.' },
  { t: 'Car is gone. The insurance man will hate me.', j: 1 },
  { t: 'Who parks next to a gas canister?' }
];
P.BarkPools.en['BK.env.chain'] = [
  { t: 'Chain reaction. Stay back.' },
  { t: 'One goes, then the next one goes.' },
  { t: 'Like dominoes, but with propane.', j: 1 },
  { t: 'How many of these things are on this street?' }
];
P.BarkPools.en['BK.env.fuse'] = [
  { t: 'The car is burning. Move!' },
  { t: 'Count to two, then run.' },
  { t: 'That thing is about to go up.' }
];
P.BarkPools.en['BK.env.shock'] = [
  { t: 'Live wire! Get out of the water.' },
  { t: 'My feet are tingling. Not in a good way.' },
  { t: 'Water and a live cable. Lesson learned.', j: 1 },
  { t: 'Do not stand in the puddle. Do not.' }
];
P.BarkPools.en['BK.env.door'] = [
  { t: 'A door opening. Get ready.' },
  { t: 'Someone is at the window.' },
  { t: 'The manhole cover is moving.' },
  { t: 'This building is out to get me.', j: 1 }
];
P.BarkPools.en['BK.env.extinguish'] = [
  { t: 'Out. Give me a second to breathe.' },
  { t: 'Foam on the fire. Good.' },
  { t: 'The extinguisher finally did something.', j: 1 }
];

// v0.7 wave 2 (lane C): first-kill barks for the new common enemies (kurye, copci). barks.js H.kill plays BK.fk.<type> on the
// first kill of each type. Written natively in English.
P.BarkPools.en['BK.fk.kurye'] = [
  { t: "Scooter zombie. Delivery's late, and it's aiming at me.", j: 1 },
  { t: 'Fast, and it came apart like a cheap umbrella.' },
  { t: "Courier's down. Somebody's dinner is going cold." }
];
P.BarkPools.en['BK.fk.copci'] = [
  { t: 'Broom guy, and a bin he wanted to ram me with.' },
  { t: 'Bin is rolling! Get off the line!' },
  { t: 'Trash everywhere now. Watch your feet.', j: 1 }
];

// v0.7 wave 3 (lane W): evolution barks for the new weapon evolutions, plus the two active skills (Simit Kalkanı, Çay Molası).
// Written natively in English. barks.js has no skill hook yet, so the BK.skill.* pools wait for one.
P.BarkPools.en['BK.evo.blacksmith'] = [
  { t: "Blacksmith's Swing! Every hit gives a little life back." },
  { t: 'Each swing patches me up a bit. Slow, heavy, and fair.' },
  { t: 'Each hit patches me up. Cheaper than a clinic, too.', j: 1 }
];
P.BarkPools.en['BK.evo.stormshield'] = [
  { t: "Storm Shield! Lightning circles me and zaps what's close." },
  { t: 'Dodge, and it zaps anyway. Even the shield is stubborn.' },
  { t: "The shield crackles. Nobody's getting a hug today.", j: 1 }
];
P.BarkPools.en['BK.evo.foamstorm'] = [
  { t: 'Foam Storm! A wider cone, and the foam sticks better.' },
  { t: 'The foam catches the spit mid-air. Clean.' },
  { t: 'Foam on the road, on them, and a bit on me.', j: 1 }
];
P.BarkPools.en['BK.evo.netspear'] = [
  { t: 'Net Spear! Everything I pinned is roped together now.' },
  { t: 'Roped in a line. Now I can deal with them in one go.' },
  { t: 'All tied up in a line, like a school trip gone wrong.', j: 1 }
];
P.BarkPools.en['BK.evo.lake'] = [
  { t: 'Fire Lake. The burning puddles have joined up.' },
  { t: 'The flames have met in the middle. No walking round that.' },
  { t: "A lake of fire. Nobody's going swimming in this one.", j: 1 }
];
P.BarkPools.en['BK.evo.twinsaw'] = [
  { t: 'Twin Saw! Two discs flying side by side.' },
  { t: 'Two discs, one left and one right. Clean and simple.' },
  { t: 'They fly in step. I just have to keep up.' }
];
P.BarkPools.en['BK.evo.fireball'] = [
  { t: 'Fireball! Gassed bottles turn into fireballs now.' },
  { t: 'The bottle hits, then rolls on, still burning.' },
  { t: 'Molotov turned fireball. That went further than planned.', j: 1 }
];
P.BarkPools.en['BK.evo.arcchain'] = [
  { t: 'Arc Chain! It jumps from one to the next.' },
  { t: 'Wet ground carries the chain further. Watch your feet.' },
  { t: 'It hops from one to the next. Keep your distance.' }
];
P.BarkPools.en['BK.evo.carbomb'] = [
  { t: 'Car Bomb Tour! The canister by the parked car blows bigger.' },
  { t: 'That bang woke up the whole street. Sorry, neighbours.' },
  { t: 'The parked car went up too. Not much of a tour.', j: 1 }
];
P.BarkPools.en['BK.evo.forge'] = [
  { t: 'Forge Mouth! Hotter flame, and it leaves scorch marks.' },
  { t: 'The ground is black where it burned. Nobody walks here.' },
  { t: "Hotter than my mum's cooker. Don't tell her.", j: 1 }
];
P.BarkPools.en['BK.evo.grinder'] = [
  { t: 'Grinder! The chainsaw never stalls now.' },
  { t: 'No stalling, no stopping. Every touch builds grind.' },
  { t: 'The engine never chokes. Unlike me on a Monday.', j: 1 }
];
P.BarkPools.en['BK.evo.hookpull'] = [
  { t: 'Hook Pull! Anything near the hook gets dragged in.' },
  { t: 'The hook catches, and the rest come to me.' },
  { t: 'The rope pulls tight and the crowd lurches my way.' }
];
P.BarkPools.en['BK.evo.minibus'] = [
  { t: 'Minibus Door! It slams down on anything close by.' },
  { t: 'The door slams shut. Whoever was near is dazed.' },
  { t: 'Slammed it like a full minibus at rush hour.', j: 1 }
];
P.BarkPools.en['BK.skill.shield'] = [
  { t: 'Simit Shield! The tray takes one hit for three seconds.' },
  { t: 'Tray up, eyes shut. Let it take the hit.' },
  { t: 'The baker is going to want that tray back.', j: 1 }
];
P.BarkPools.en['BK.skill.tea'] = [
  { t: 'Tea break. One sip, a little breath, a little health.' },
  { t: "Tea's poured and the crowd slows right down." },
  { t: 'Tea break. Even the zombies could use a sit-down.', j: 1 }
];
// v0.7 wave 2 (W2-EN): env breaks, side objectives, boss phases. Native lines; one joke in four or fewer.
P.BarkPools.en['BK.env.break'] = [
  { t: 'Glass everywhere. Watch your feet.' },
  { t: 'Wood gave way. Good to know for later.' },
  { t: 'Something broke. Keep moving before anyone looks.' },
  { t: 'That was a shop window. Sorry, shop owner.', j: 1 }
];
P.BarkPools.en['BK.obj.start'] = [
  { t: 'Side job on the list. I can keep an eye on it.' },
  { t: 'Bonus on offer if I pull this off. Worth a look.' },
  { t: 'Extra task. Nobody asked, but it pays.', j: 1 },
  { t: 'Something else to do on the way. Head up.' }
];
P.BarkPools.en['BK.obj.done'] = [
  { t: 'Done. One bonus in the bag.' },
  { t: 'Got it, quick and clean.' },
  { t: 'Side job done. Nobody clapped. I clapped.', j: 1 },
  { t: "That's the side job. Back to the street." }
];
P.BarkPools.en['BK.obj.fail'] = [
  { t: 'Missed it. Forget it, keep going.' },
  { t: 'Lost it. Next time, faster.' },
  { t: "Gone, and the bonus with it. I'll sulk later.", j: 1 }
];
P.BarkPools.en['BK.boss.phase'] = [
  { t: "It's changing. Stay sharp, it's not finished." },
  { t: 'Second wind. Brilliant. Exactly what I needed.' },
  { t: 'Round two. Nobody told me there was a round two.', j: 1 }
];
P.BarkPools.en['BK.ev.chest'] = [
  { t: "A chest! Somebody's stash, and now it's mine." },
  { t: 'Supply chest on the street. Grab it before the crowd does.' },
  { t: 'Chest on the pavement. Who leaves a chest on the pavement?', j: 1 }
];
P.BarkPools.en['BK.evend.chest'] = [
  { t: "Chest's open. Mostly good stuff." },
  { t: 'Got what was in it. Moving on.' },
  { t: 'Two socks and a torch. Still counts.', j: 1 }
];
P.BarkPools.en['BK.ev.pier'] = [
  { t: "The ferry's in. Everyone off the pier at once." },
  { t: "Ferry's here, and those people are coming straight at me." },
  { t: "Ferry's in. Nobody told the zombies about the queue.", j: 1 }
];
P.BarkPools.en['BK.evend.pier'] = [
  { t: "Ferry's clear. Back to the street." },
  { t: 'The pier is quiet again. For now.' },
  { t: "Ferry's gone. Did the captain see any of that?", j: 1 }
];
