// Chapter 1 arrival, English (native writing, not a translation of the Turkish): the walk into Ataköy, the comic (FINa*,
// FINb*) and the "Chapter 1 complete" card (fin.*). Same ids and speakers as finale-lang-tr.js. "Mum" matches the
// existing EN speaker name (strings-story.js). Dad's letter keeps the canon content of narrative.md (Letter #1).
P.FinaleLang = P.FinaleLang || {};
P.FinaleLang.en = {
  lines: {
    FINa1: ["spk.cap", "Ataköy. Beige stucco, blue shutters, washing still on the lines. Ahmet Abi's booth is empty. So is the bread basket. Kaan would have checked the bottom of it twice."],
    FINa2: ["spk.cap", "Third floor. The balcony light is on. Mum always left it on when I came home late."],
    FINa3: ["spk.arda", "Nobody's there. But the light's on."],
    FINa4: ["spk.arda", "Mum? Can you hear me? I'm outside the building."],
    FINa5: ["spk.anne", "Son! Your voice is so clear! Take your shoes off at the door. Don't you dare walk on the carpet."],
    FINb1: ["spk.cap", "On the kitchen table, between two dried-up cups: an envelope. Dad's handwriting."],
    FINb2: ["spk.anne", "The flat's empty, I know. The letter's on the table, love. Read it. Then we'll talk."],
    FINb3: ["spk.baba", "Son, Mum and Dede are in Sarıyer, at Dede's place. Keep off the highways."],
    FINb4: ["spk.baba", "Whatever the radio says about the forest up north, stay away from it."],
    FINb5: ["spk.baba", "Love you. Dad."],
    FINb6: ["spk.cap", "Someone knocks on the door."],
    FINb7: ["spk.arda", "Who's there?!"],
    FINb8: ["spk.mila", "Arda! You're heading to Sarıyer, right? My parents' safe house is in Zekeriyaköy, right next to it. I'm going there too."],
    FINb9: ["spk.cap", "The walk to Ataköy is over. The road to Sarıyer starts now."]
  },
  ui: {
    'cm.tag.arrival': 'ARRIVAL',
    'cm.sfx.tak': 'KNOCK KNOCK!',
    'fin.approach.title': 'ATAKÖY',
    'fin.approach.km': '{a} / {b} km',
    'fin.approach.hint': 'Walk to the door',
    'fin.approach.hintTouch': 'Drag to walk',
    'fin.credits.kicker': 'CHAPTER 1 COMPLETE',
    'fin.credits.title': 'HOMECOMING',
    'fin.credits.route': 'Taksim → Ataköy · 17 km · 100 levels',
    'fin.stat.km': 'walked',
    'fin.stat.levels': 'levels',
    'fin.stat.hoods': 'neighbourhoods',
    'fin.stat.kills': 'zombies (career)',
    'fin.stat.bosses': 'hood bosses',
    'fin.stat.runKills': 'zombies (this level)',
    'fin.stat.runTime': 'time (this level)',
    'fin.next.kicker': 'NEXT',
    'fin.next.text': 'Chapter 2 · Before the Battery Dies: with Mila, toward Sarıyer and Zekeriyaköy.',
    'fin.credits.note': 'Prototype · Project Istanbul. Audio, music and text are drafts.',
    'fin.credits.go': 'Continue',
    'fin.credits.hint': 'Tap to see results'
  }
};
