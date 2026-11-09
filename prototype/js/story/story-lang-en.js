// Native en story text overrides (v0.7). Format: P.LangText.en[lineId or STR key] = 'text'.
// W2-EN: English rewrites of translated-feeling, forced or nonsensical lines. Plot and information unchanged.
// Each rewrite is within 15% of the original English length (comic boxes must fit).
// Mom is Mum in English (British voice). Speaker key spk.anne is overridden to match.
P.LangText = P.LangText || {};
P.LangText.en = {};

// Speaker label (P.STR)
P.LangText.en['spk.anne'] = 'Mum';

// Story pages and in-level lines (P.LINES)
P.LangText.en['barkRunners'] = "Are those RUNNING?! Running's my thing. Get your own!";
P.LangText.en['callA1'] = "Mum? Can you hear me? I can hear something. Please be you.";
P.LangText.en['callA3'] = "Saw it... well, lived it. I'm in Taksim. You pray. I'll walk.";
P.LangText.en['callC2'] = "Mum? You're breaking up! The signal's like me. Never finishes a sentence.";
P.LangText.en['exit2'] = "Mum? ...Mum! Even the phone gave up.";
P.LangText.en['O1b'] = "I promised Mum. No clause about zombies.";
P.LangText.en['H01i1b'] = "Enjoy! Don't grip it so hard. Let the weight do the work.";
P.LangText.en['H03i1b'] = "Tempting. Still not stopping.";
P.LangText.en['H03i2b'] = "The cat's following us. Guide, or just nosy?";
P.LangText.en['H05i2a'] = "My captain's boat is still tied up here. He'd never leave it.";
P.LangText.en['H05i3b'] = "Kaan, behind you! Right there! Move!";
P.LangText.en['H05p3'] = "Ah-choo... Still alive. Bless me, then.";
P.LangText.en['H09i2a'] = "A meze place used to be here. I came every summer. The bill always hurt. Now it's free.";
P.LangText.en['H12p2'] = "They're lined up on the stairs. Hold the rail.";
P.LangText.en['H18i2a'] = "He gave me a free ice cream once. Now I can't pay him back.";
P.LangText.en['H19i2b'] = "Ahmet Abi's bread's in there. Stale, but a decent shield.";
P.LangText.en['L02m'] = "Rush a dürüm, it burns. Not on my grill.";
P.LangText.en['L07m'] = "Acid puddles. You won't slip in them, but you'll slow down.";

// Mom's calls (P.LINES C-ids)
P.LangText.en['C05d'] = "Okay, Mum. Where are you?";
P.LangText.en['C15b'] = "Mum! Slow down, you're cutting out. Like everything lately.";
P.LangText.en['C15d'] = "North? Mum? ...Mum!";
P.LangText.en['C30b'] = "Mum, where are you? Your voice is so clear!";
P.LangText.en['C30d'] = "I'm coming, Mum. You wait too.";
P.LangText.en['E30b'] = "Mum? Can you hear me? ...No.";
P.LangText.en['E30c'] = "I'm walking, Mum. I'm walking.";
P.LangText.en['C50b'] = "Mum! Just say one word, that's enough! Say 'food' and I'll run.";
P.LangText.en['C50d'] = "Ahmet Abi? Mum? ...Mum!";
P.LangText.en['C70a'] = "Mum! It's connected! I can hear you!";
P.LangText.en['C70c'] = "I remember, Mum. Are you okay?";
P.LangText.en['C70e'] = "I'm close, Mum. Wait for me.";
P.LangText.en['C90b'] = "I'm by the marina, Mum. Last kilometre.";
P.LangText.en['C90d'] = "I'm coming, Mum. I'll be at your door tomorrow morning. Wearing a jacket, promise.";

// Level events from config-levels.js (merged into P.LINES before lang-apply runs)
P.LangText.en['barkBloater'] = "A bloated waiter just burst out of the shop!";

// Legacy bark lines in P.LINES (the old TR-file English, superseded by P.BarkPools.en). Only the lines with
// banned terms or earthquake imagery are replaced, so none can surface if the engine falls back to P.LINES.
P.LangText.en['BK.card.manhole.1'] = "Manhole cover. I'm sure someone wants it back.";
P.LangText.en['BK.act.bloaterSwell.4'] = "Bloated one! Stay away, stay away.";
P.LangText.en['BK.self.26'] = "Who's in charge of this street? Nobody. Brilliant.";
P.LangText.en['BK.act.bossSlam.1'] = "The ground thumped! Lifting my feet.";
P.LangText.en['BK.act.bossSlam.3'] = "The ground thumped. The ground's tired too.";
