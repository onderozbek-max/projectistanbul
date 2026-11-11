# Project Istanbul: Hood Visual Briefs (R1-T3)

> **Status:** draft v0.1 · 2026-11-10 · Owner: Onder · Roadmap task R1-T3 (arenas)
> **Sources:** [hoods-bible.md](hoods-bible.md) (H01–H20, §1 rules, §5 walk data) · [design-system.md](design-system.md) §2, §3, §5, §6 · [product.md](product.md) D-057 · [narrative.md](narrative.md) (Writer Guardrails) · `prototype/js/journey.js`

## What this doc is

One brief per hood for the arena art: what makes the hood read as Istanbul, the props on the ground, the materials and light, and how the hood differs from its neighbours. It briefs the authored SVG backgrounds. It is not the final art.

**Pipeline (D-057).** Backgrounds (ground, facades, props) are authored vector SVG with `night_ink` outlines, slight wobble, paint grain, and cel shading (warm light side, cool shadow side). Characters and busts stay on the procedural engine (`ComicBusts`, `ComicCast`).

**Today.** Arenas are canvas code. Each hood has a `def()` theme in `prototype/js/view/istanbul-themes.js` (ground, facade and awning kinds). Props are drawn in `istanbul-props*.js` and `istanbul-landmarks.js`. The gameplay kit from `config-levels.js` is placed as solid blocks by `sim/levels.js`. The palette tokens exist only in the docs, and the code uses its own hex values (for example `#C0392B` awnings), so the SVG pass maps them to tokens.

**Prop rules used on every page.**
- *Solid* props are kit blocks from `config-levels.js`. The SVG footprint must match the kit size in metres. *Breakable* means the kind has an HP entry in `config-env.js`, and broken cover can drop simit.
- *Dressing* has no collision and never competes with enemies, projectiles or pickups (design-system §6.1). Keys, lanterns, the bell and simit are pickups or objectives and must not read as dressing.
- Awnings, laundry and bus shelters are overhangs and fade to 30% alpha over the player (§6.5).
- Floors sit at mid value, in the `stone_grey` range (§6.4).
- Accent hex values are proposals. They are not yet in design-system §3, and none reuses a gameplay token (§3.2).
- "Left" and "right" in the light lines are screen sides in the 3/4 view.

**Guardrails.**
- No real brands, crests or transit liveries. Trams are generic red, taxis generic yellow.
- No police, military, state symbols or *bekçi* (night watchman).
- No earthquake imagery. Pavement pops and dust puffs only.
- Religious buildings are background only, never a target, and never shown damaged.
- No flashes over 3 per second. This covers fluorescent flicker, welder sparks and fire.
- No pixel lettering. All signage is vector text.

Every shop and sign name below is fictional and needs a TR owner check.

## Summary

| ID | Hood | Dominant palette | Main landmark | Light |
|---|---|---|---|---|
| H01 | İstiklal | Stone grey, tram red, shopfront gold | Nostalgic tram line, Tünel funicular | Evening, warm shopfronts |
| H02 | Galata | Stone grey, tea amber, shutter green | Galata Tower (background) | Evening, amber lanterns, no neon |
| H03 | Karaköy | Cream and coral, bosphorus blue water | Galata Bridge landing, pier and café row | Dusk to evening, café lamps, fog |
| H04 | Galata Köprüsü | Painted iron, rust, lantern gold | Galata Bridge, two decks | Dusk into night, fog and rain |
| H05 | Eminönü | Sumac red, spice colours, grill fire | Spice Bazaar arcade, ferry gangway | Night, fire glow, boat lights |
| H06 | Sirkeci | Cold tile and iron, dust gold | Station clock and façade | Night, cold fluorescent (under 3 Hz) |
| H07 | Kapalıçarşı | Brown vault, brass, kilim red | Grand Bazaar vaults | Night, indoors, lantern light only |
| H08 | Beyazıt | Paper and book tones, plane green | University gate, Sahaflar | Night, warm book-lamp light |
| H09 | Kumkapı | Red and gold lanterns, wet stone | Marmara quay, fish restaurants | Night, lanterns, sea mist |
| H10 | Laleli | Sodium orange, carton brown | Wholesale arcades (no single landmark) | Deep night, sodium lamps |
| H11 | Aksaray | Minibus cream, taxi yellow, bread brown | Junction and bus shelters | Night, headlights, döner fire |
| H12 | Yenikapı | Tile blue, timber hull brown, torch amber | Marmaray hall, excavation display | Night, torch only, blackout |
| H13 | Samatya | Dawn pink and gold, stone grey | Marmara sea wall and promenade | Pre-dawn to sunrise over the sea |
| H14 | Yedikule | Old stone, ivy green, morning blue | Yedikule Fortress, Theodosian walls | Sunrise into morning |
| H15 | Kazlıçeşme | Lawn green, sprinkler water, warm sun | Marmara coast path, rail sleepers | Full day, warm |
| H16 | Zeytinburnu | Teal and magenta drums, brick | Textile yards and dye drums (generic) | Daylight with haze, welder sparks |
| H17 | Bakırköy Çarşı | Dusty cream, school green, skylight white | Arcade and the school next door | Morning, skylight dust beams |
| H18 | Bakırköy Sahil | Pastel blue and white, ice-cream pink | Seafront promenade, ice-cream cart | Late morning, pastel |
| H19 | Ataköy Marina | White hulls, teal water, morning gold | Marina basin and pontoons | Morning, gold on the hulls |
| H20 | Ataköy | Beige stucco, blue shutters, laundry white | Block façades and courtyard | Morning, dawn at the boss |

---

## H01 · İstiklal

`istiklal` · Beyoğlu · L1–5 · km 1.0 · Boss: The Vatman

**Reads as Istanbul because:** The nostalgic tram on the İstiklal line, generic red with no livery. The Tünel funicular station at the south end. Chestnut and corn carts sending steam into the street.

**Props (ground and street level):** tram rails in the centre lane (dressing); simit cart (solid, breakable); chestnut cart (solid, breakable); pavement tables (solid, breakable); street bin (solid, breakable); bench (solid, breakable); shopfront awnings (dressing, overhang).

**Materials:** Ground: `stone_grey` paving with `night_ink` joints. Walls: `paper` render with `tea_amber` trim. Awnings: `tram_red` and `simit_gold` stripes. Accent: `#2E7D4F` bookshop green.

**Signage and text:** Lale Kırtasiye, Dede Kestaneci, Sarı Pasaj Pastanesi, Gece Eczanesi. TR owner check.

**Light:** Evening, clear, warm and busy. Warm from the shopfront side (left). Cool shadow on the right-hand walls and under the tram roof, `bosphorus_blue` at about 20%.

**Ambient sound idea:** Tram bell and simit calls over the street bed.

**Contrast with neighbours:** First arena of the walk, so there is no previous hood. Galata is steep, narrow and amber with no tram, so İstiklal must stay wide, flat and red and grey.

---

## H02 · Galata

`galata` · Beyoğlu · L6–10 · km 1.8 · Boss: Tour Guide

**Reads as Istanbul because:** Galata Tower, shown with respect and kept to the background in fights. Steep cobbled stairs with cats on the steps. Tavla boards and çay urns on the street.

**Props (ground and street level):** stair treads and handrails (dressing); flower pots on balconies (dressing); tavla tables (solid, breakable); street bench (solid, breakable); planter (solid, breakable); stair-head bollard (solid); balcony lanterns off the lane (dressing). Stair lanterns are pickups, so keep these distinct.

**Materials:** Ground: `stone_grey` cobble with `night_ink` joints. Walls: `paper` plaster and `tea_amber` timber balconies. Roofs: `night_ink` tile. Accent: `#2E5E4E` shutter green.

**Signage and text:** Tavla Evi, Hendek Çay Ocağı, Kulis Müzik, Taş Merdiven Lokantası. TR owner check.

**Light:** Evening, drizzle then clear, amber lantern light and no neon. Warm from the balcony and lantern side (right). Cool shadow on the stair side and under the balconies, `bosphorus_blue` at low alpha.

**Ambient sound idea:** Tavla clacks and a saz from a radio, with distant ferry horns.

**Contrast with neighbours:** İstiklal is wide, flat and lit by shopfronts, so Galata must be steep, narrow and lantern-lit. Karaköy is flat with open water at the edge, so keep Galata enclosed by balconies with no water in view.

---

## H03 · Karaköy

`karakoy` · Beyoğlu · L11–15 · km 2.6 · Boss: The Bride

**Reads as Istanbul because:** The Galata Bridge landing at Karaköy, the pier and its café row, and ferries leaving the pier. The T1 tram stops on the quay.

**Props (ground and street level):** quay bollards (solid); pastry stall (solid); café terrace tables (solid, breakable); tram-stop barrier (solid); ferry gangway and pier boards (dressing); paper lanterns on the terraces (dressing); gull perches on the bollards (dressing).

**Materials:** Ground: `stone_grey` quay paving, `bosphorus_blue` water at the edge. Walls: `paper` café fronts with coral trim. Awnings: `paper` and coral stripes. Roofs: `night_ink`. Accent: `#E07A5F` coral.

**Signage and text:** Vapur Pastanesi, Kıyı Kavurma, Rıhtım Lokumcusu, Çift Kahve. TR owner check.

**Light:** Dusk to evening, fog at the start, damp and expectant. Warm from the café lamps on the terraces (right). Cool shadow on the water side and under the bollards, `bosphorus_blue`.

**Ambient sound idea:** Ferry horns and gulls over espresso machines.

**Contrast with neighbours:** Galata has no water in view, so Karaköy shows open water and cream-and-coral fronts. Galata Köprüsü is iron and water with no shopfronts, so the café row must stop at the bridge landing.

---

## H04 · Galata Köprüsü

`bridge` · Haliç · L16–20 · km 3.3 · Boss: Big Fisherman

**Reads as Istanbul because:** The Galata Bridge itself, a two-deck iron bridge. Anglers at the upper rail and fish restaurants on the lower deck. Eminönü's domes far behind, background only.

**Props (ground and street level):** rod holders on the upper rail (dressing); fishing lines across the deck (gameplay, the stage 2 cut objective); bollards (solid); barrier at the lower-deck stairs (solid); tackle crates (solid, breakable); bin (solid, breakable); lantern strings over the lower deck (dressing).

**Materials:** Ground: `stone_grey` deck walkway. Parapets: painted iron in `night_ink`. Lower-deck restaurant awnings: `simit_gold`. Accent: `#A5542B` rust.

**Signage and text:** Köprü Balık Lokantası, Taze Midye, Yeşil Oltacı, Alt Kat Çay. TR owner check.

**Light:** Dusk into night, clear at the start, then fog and rain. Warm from the lower-deck lanterns (right), `simit_gold`. Cool shadow from the White Horn fog on the upper rail and under the deck, `bosphorus_blue`.

**Ambient sound idea:** Reels clicking and gulls, with boat engines below.

**Contrast with neighbours:** Karaköy has café fronts and a quay, so the bridge has no building fronts, only iron and water. Eminönü is crowded and spice-coloured, so keep the bridge grey and iron.

---

## H05 · Eminönü

`eminonu` · Fatih · L21–25 · km 4.1 · Boss: The Captain

**Reads as Istanbul because:** The Spice Bazaar (Mısır Çarşısı) arcade, built in the mid-1600s. The ferry gangway and quay. Domes in the skyline, background only.

**Props (ground and street level):** spice sack pyramids (solid, breakable, sized to the crates kit, so they must look solid); balık ekmek boat rails at the quay (dressing); corn cart (solid, breakable); fishing crates (solid, breakable); spice stall (solid); pier bollards (solid); ferry gangway (dressing).

**Materials:** Ground: `stone_grey` quay with worn cobble. Walls: `paper` arcade arches with `tea_amber` piers. Awnings: `tea_amber` and `simit_gold`. Accent: `#A8322D` sumac red.

**Signage and text:** Karabiber Kemal, Sumak Kadir, Kuruyemiş Nuri, Gemici Balık Ekmek. TR owner check.

**Light:** Night begins, with fire glow from the fish grills and boat lights at the end. Warm from the grill fire and corn carts (left). Cool shadow under the arcade and off the water, `bosphorus_blue`.

**Ambient sound idea:** Ferry horn (vapur düdüğü) over vendors calling.

**Contrast with neighbours:** Karaköy is pale cream under open sky, so Eminönü is dense and dark under an arcade. Sirkeci is a grey iron terminal with no spice colour, so keep Eminönü's colour in the sacks and awnings.

---

## H06 · Sirkeci

`sirkeci` · Fatih · L26–30 · km 4.8 · Boss: The Ticket Man

**Reads as Istanbul because:** The Sirkeci station clock and façade. The Golden Horn shore beyond the glass. Sirkeci was the Istanbul end of the Orient Express line.

**Props (ground and street level):** station clock on the wall (dressing); platform edge and rails (dressing); turnstile gates (gameplay, shutter terminals, turnstile art proposed); ticket kiosk (solid, breakable); concourse benches (solid, breakable); luggage cart (solid, breakable); suitcases on the platform (dressing).

**Materials:** Ground: `stone_grey` tile with `night_ink` joints. Walls: `stone_grey` station façade with `paper` trim. Girders: `night_ink`. Glass roof: `bosphorus_blue` at low alpha. Accent: `#5E7A8C` steel blue.

**Signage and text:** BİLET GİŞESİ, BAGAJ EMANET, KALKIŞ TABLOSU, ÇAY OCAĞI. TR owner check.

**Light:** Night, rain then fog indoors, cold and waiting. Warm from the high windows and the tea urn (left). Cool shadow under the girders, `bosphorus_blue`. Fluorescent flicker stays under 3 Hz.

**Ambient sound idea:** Clock tick and the departure bell.

**Contrast with neighbours:** Eminönü is an open quay in warm spice colour, so Sirkeci is enclosed, grey and cold. Kapalıçarşı is brown vault and brass with lantern light and no trains, so keep Sirkeci's iron and tile out of the bazaar.

---

## H07 · Kapalıçarşı

`kapalicarsi` · Fatih · L31–35 · km 5.6 · Boss: The Carpet Golem

**Reads as Istanbul because:** The Grand Bazaar vaults and their lanes, one of the world's oldest covered markets. Hanging kilims and brass lanterns. Shutters with painted numbers.

**Props (ground and street level):** hanging kilims on the arches (dressing, overhang); brass lanterns on chains (dressing, kept off the lane); shutter terminals with painted numbers (gameplay, hack.gate); jeweller counters (solid); rolled carpets (solid, breakable); tea-tray cart (solid, breakable); tea glasses on the counters (dressing).

**Materials:** Ground: `stone_grey` flags with `tea_amber` dust in the joints. Walls: `paper` plaster with `tea_amber` wood trim. Vaults: `night_ink`, with `bosphorus_blue` at 40% in the undersides. Accents: `#8E2B2B` kilim red and `#2A7F80` turquoise.

**Signage and text:** Nazlı Kuyumcu, Halıcı Recep, Lokumcu Cevdet, Kahveci Sadık, and the shutter note KAPIYI AÇMAYIN. TR owner check.

**Light:** Night, indoors, lantern light only, no neon. Warm from the brass lanterns and the coffee-stall fire (right), `simit_gold`. Cool shadow on the left walls and in the vault undersides.

**Ambient sound idea:** Vendors calling "buyurun" and tea spoons on glass, with shutters clanking.

**Contrast with neighbours:** Sirkeci is a grey, sky-lit station, so the bazaar must be warm, enclosed and vaulted. Beyazıt is an open square with plane trees and sky, so no vaults or lanterns show there.

---

## H08 · Beyazıt

`beyazit` · Fatih · L36–40 · km 6.3 · Boss: The Pigeon Man

**Reads as Istanbul because:** The Istanbul University gate on the square (gate name to confirm). The Sahaflar second-hand book market next to the square. The mosque on the square, background only.

**Props (ground and street level):** book crates (solid, breakable); bookstall (solid); student café tables (solid, breakable); bench (solid, breakable); plane trees around the square (solid); pigeon flock (gameplay, flock walk proposed); crumb tins for feeding (dressing).

**Materials:** Ground: `stone_grey` setts with `night_ink` joints. Walls: `paper` and `tea_amber` façades, with book spines in `night_ink`. Awnings: canvas in the accent green. Accent: `#4F7A3A` plane green.

**Signage and text:** Sahaf Lale, Eski Kitap Ferit, Kırtasiye Yaprak, Kestaneci Dede. TR owner check.

**Light:** Night, warm book-lamp light, fog at the start, then rain and clear. Warm from the book-lamps (right), `tea_amber` and `simit_gold`. Cool shadow under the plane trees, `bosphorus_blue`.

**Ambient sound idea:** Wings clapping over the square, with students and booksellers.

**Contrast with neighbours:** Kapalıçarşı is a closed vault lit only by lanterns, so Beyazıt is open sky, trees and pigeons. Kumkapı is wet stone, lanterns and sea with no books, so keep Beyazıt dry and paper-toned.

---

## H09 · Kumkapı

`kumkapi` · Fatih · L41–45 · km 7.0 · Boss: The Fish Porter

**Reads as Istanbul because:** The Marmara quay with fishing boats moored and rods on the wall. Restaurant lanes with red and gold lanterns. The fish restaurants on the Marmara coast (postcard fact).

**Props (ground and street level):** fish crates on ice (solid, breakable); meze tables (solid, breakable); fish-ice cart (solid, breakable); quay bollards (solid); moored fishing boat (gameplay, the stage 3 boat wait); rods on the quay wall (dressing); red and gold lantern strings (dressing, overhead).

**Materials:** Ground: `stone_grey` cobble, kept at mid value even when wet. Walls: `paper` plaster with `tea_amber` trim. Lanterns and awnings: `tram_red` and `simit_gold`. Accent: `#6B3E26` dark wood.

**Signage and text:** Taze Balık Hüseyin, Sofra Ali Usta, Meyhane Nermin, Buz Depo. TR owner check.

**Light:** Night, rain, then fire from the meyhane grills, with sea mist and no flashing. Warm from the lantern and grill side (right). Cool shadow from the sea mist on the quay side, `bosphorus_blue`.

**Ambient sound idea:** A fasıl band from a restaurant, the sea and crushed ice.

**Contrast with neighbours:** Beyazıt is a dry square with trees and books, so Kumkapı is wet stone, lanterns and sea. Laleli is dry, sodium-lit streets with no sea, so keep the water and lanterns here.

---

## H10 · Laleli

`laleli` · Fatih · L46–50 · km 7.8 · Boss: The Wholesaler

**Reads as Istanbul because:** The wholesale arcades are the landmark, since the bible names no single building. Shop windows full of mannequins. Laleli is known for wholesale clothing and luggage shops.

**Props (ground and street level):** carton stacks (solid, breakable); hand carts on the tiles (solid, breakable); loading truck at the kerb (solid); bins (solid, breakable); mannequins in the windows (dressing until the wake, then enemies, so keep a distinct outline); luggage stacks (dressing); sodium lamp poles (dressing, out of the lane).

**Materials:** Ground: `stone_grey` tile with `night_ink` joints. Walls: `paper` shopfronts with `stone_grey` piers. Awnings and shutters: `tea_amber`. Accent: `#8B6B4A` carton brown.

**Signage and text:** Valiz Cengiz, Çanta Gül Toptan, Mankenci Sevim, Kumaş Melek. TR owner check.

**Light:** Deep night, fog, then clear and rain. Sodium orange from the street lamps (left), the warmest colour in the hood. Cool shadow from the grey carton stacks, `bosphorus_blue`. Fire from the bins in stage 4.

**Ambient sound idea:** Hand carts rolling on tiles, shutters and radios.

**Contrast with neighbours:** Kumkapı has wet quay and red and gold lanterns, so Laleli is dry, sodium-orange and grey-brown with no water. Aksaray is an open junction lit by headlights, so keep Laleli's shopfronts and carts off the road.

---

## H11 · Aksaray

`aksaray` · Fatih · L51–55 · km 8.6 · Boss: The Dolmuş Driver

**Reads as Istanbul because:** The Aksaray junction and its bus shelters, generic with no livery. Minibuses and taxis in neutral colours. Dolmuş drivers calling their destinations. Interchange status: no bible fact, proposed.

**Props (ground and street level):** dolmuş minibus (solid, breakable); taxi (solid, breakable); road barrier (solid); kerb bollards (solid); bus shelter (dressing, overhang); traffic cones (dressing); pide peel rack at the bakery door (dressing).

**Materials:** Ground: `stone_grey` asphalt with `night_ink` lane paint. Walls: `paper` concrete fronts, `tea_amber` brick at the pide bakery. Shelter glass: `bosphorus_blue` at low alpha. Accent: `#E5C02A` taxi yellow.

**Signage and text:** Kavşak Pide Fırını, Halil Ocakbaşı, Şoför Lokantası, Durak Büfesi. TR owner check.

**Light:** Night, rain then fog, with fire glow from the döner spits in stage 3. Warm from the bakery oven and spits (left), `tea_amber`. Cool shadow and wet tarmac reflections in `bosphorus_blue`. Headlights act as the white lane markers.

**Ambient sound idea:** Dolmuş drivers shouting destinations, horns and the bakery oven.

**Contrast with neighbours:** Laleli is dead shopfronts and carts with no traffic, so Aksaray is open, lit by headlights, with vehicles in the lanes. Yenikapı is underground and tiled, so keep the junction open to the sky.

---

## H12 · Yenikapı

`yenikapi` · Fatih · L56–60 · km 9.5 · Boss: The Evening Crowd

**Reads as Istanbul because:** The Marmaray station hall, underground with tiled bands on the walls. The Yenikapı excavation display on the walls, with the Byzantine ship hulls found in the dig.

**Props (ground and street level):** ticket gates (gameplay, shutter terminals); safety barriers (solid); station benches (solid, breakable); litter bins (solid, breakable); platform bollards (solid); stopped escalators (dressing); excavation trench sections (gameplay, the blackout event); hull display panels (dressing).

**Materials:** Ground: `stone_grey` tile with `night_ink` joints. Walls: `bosphorus_blue` tile bands and `paper` tile. Ceiling: `night_ink`. Accent: `#7A5230` hull timber.

**Signage and text:** Kazı Bilgi Panosu, Asansör Kapalı, Peron 2, Bilet Kapısı. TR owner check.

**Light:** Night, torch light only, grey daylight at the top stairs. Warm from the torches (left), `tea_amber`. Cool shadow from the `bosphorus_blue` tile and the dark of the stage 3 power cut. Flicker stays under 3 Hz.

**Ambient sound idea:** Echo and dripping, with generic station announcements.

**Contrast with neighbours:** Aksaray is an open junction with traffic and headlights, so Yenikapı has no sky, only tile and torch. Samatya is open sea at dawn, so Yenikapı must stay sealed and dark.

---

## H13 · Samatya

`samatya` · Fatih · L61–65 · km 10.3 · Boss: The Grill Man

**Reads as Istanbul because:** The Marmara sea wall and promenade. Fishing rods on the rocks and abandoned picnic blankets. The sunrise over the sea at stage 5, the hood's signature.

**Props (ground and street level):** picnic blankets (gameplay, proposed: blankets stop zombies); gözleme cart (solid, breakable); tea tables with glasses (solid, breakable); benches (solid, breakable); sea-wall bollards (solid); fishing rods on the rocks (dressing); cats on the blankets (dressing; cats hiss and are never harmed).

**Materials:** Ground: `stone_grey` promenade paving and sea wall. Background houses in timber (no bible fact, proposed). Cart awning: `tea_amber`. Accents: `#A8322D` blanket red and `#E7A6A0` dawn pink.

**Signage and text:** Deniz Gözleme, Sahil Çay Ocağı, Teyze Sofrası, Mangal Fehmi. TR owner check.

**Light:** Deep night and fog, then clear, rain, and pre-dawn into sunrise. Warm from the grill and the sunrise gold (`simit_gold`) on the sea side (right). Cool shadow on the sea wall, `bosphorus_blue`.

**Ambient sound idea:** The sea, gulls and wind, with a radio from a table.

**Contrast with neighbours:** Yenikapı is tile and torchlight underground, so Samatya is open sea and sky. Yedikule has city walls and gardens, so this sea wall must read as a seafront, not a fortress.

---

## H14 · Yedikule

`yedikule` · Fatih · L66–70 · km 11.1 · Boss: The Key Keeper

**Reads as Istanbul because:** The Yedikule Fortress and the Theodosian walls, built in 1458 at the southern end of the walls. Gardens and a tea garden inside the walls. Ivy on the stone.

**Props (ground and street level):** wall-walk parapet (boundary, solid edge); garden keys (gameplay, the stage 3 collect.key pickups); garden planters (solid, breakable); garden cart (solid, breakable); garden trees (solid); gardener's bin (solid, breakable); ivy on the stone (dressing); tea-garden tables (solid, not in the kit yet, and stage 4 needs them).

**Materials:** Ground: `stone_grey` cobble and gravel path. Walls: `stone_grey` stone with ivy in green. Gatehouse roof: `tea_amber` tile. Accents: `#2E5E4E` ivy green and `#7FA7C4` morning blue.

**Signage and text:** Surlar Çay Bahçesi, Bostan Ali, Anahtarcı Mahmut, Gül Fidancı. TR owner check.

**Light:** Sunrise, then morning, with a dawn wash at stage 3. Morning blue and ivy green. Warm sunrise gold (`simit_gold`) on the wall tops (right). Cool shadow inside the walls, `bosphorus_blue`.

**Ambient sound idea:** Birds, running water and gate keys.

**Contrast with neighbours:** Samatya is open sea and sky at dawn, so Yedikule is walled, green and enclosed. Kazlıçeşme is an open coast path with lawns and sprinklers and no walls, so keep the stone and ivy here.

---

## H15 · Kazlıçeşme

`kazlicesme` · Zeytinburnu · L71–75 · km 12.0 · Boss: The Hose Man

**Reads as Istanbul because:** The Marmara coast path, a seaside running path. Old rail sleepers along the edge. Kazlıçeşme is a Marmaray station between Yenikapı and Zeytinburnu.

**Props (ground and street level):** sprinkler heads (gameplay, the wet-ground rule is proposed); rail sleepers (dressing); park benches (solid, breakable); bins (solid, breakable); trees (solid); path bollards (solid); barbecue stands (dressing, with a warm glow).

**Materials:** Ground: `stone_grey` path and lawns in `#3F6B3A` lawn green. Rail sleepers: `tea_amber` timber with `night_ink` rails. No walls, since the sea is the edge. Accent: `#7FB8C9` sprinkler water.

**Signage and text:** Kıyı Çay Bahçesi, Mangal Sabri, Simitçi Zeki, Kıyı Mısırcısı. TR owner check.

**Light:** Full day, warm. Rain, barbecue smoke, fog, clear, then rain. Warm sun from the lawn side (left), `simit_gold`, with water droplets. Cool shadow from the trees on the path, `bosphorus_blue`.

**Ambient sound idea:** Sprinklers hissing, joggers' feet and gulls.

**Contrast with neighbours:** Yedikule is stone walls, ivy and enclosed gardens, so Kazlıçeşme is open lawn and sea. Zeytinburnu is brick, concrete and factory yards with no sea, so keep the lawns and water here.

---

## H16 · Zeytinburnu

`zeytinburnu` · Zeytinburnu · L76–80 · km 13.0 · Boss: The Dye Foreman

**Reads as Istanbul because:** Textile workshops and yards with dye-coloured drums. The canal in the far background. The bible names no single landmark here, so the workshops carry the hood.

**Props (ground and street level):** dye drums (solid, chain explosions proposed); bale stacks (solid, breakable); conveyor belt (gameplay, zombies ride it in stage 3); fabric carts (solid, breakable); delivery truck (solid); workshop bins (solid, breakable); tost kiosk (solid, breakable).

**Materials:** Ground: `stone_grey` concrete with `night_ink` cracks. Walls: `tea_amber` brick and `stone_grey` concrete. Sawtooth roofs: `night_ink`. Accents: `#2A7F80` dye teal and `#A8327D` dye magenta. Yellow drums use `simit_gold`.

**Signage and text:** Boya Atölyesi Naci, Dokuma Yaprak, Balya Deposu Osman, Tost Sadık, and PERSONEL GİRİŞİ. TR owner check.

**Light:** Morning daylight with haze, rain in stage 2, then welder sparks and drum fire in stage 4, kept under 3 flashes per second. Warm sun in `simit_gold` from the yard side (left). Cool shadow under the sawtooth roofs, `bosphorus_blue`.

**Ambient sound idea:** Machines, forklift alarms and radios.

**Contrast with neighbours:** Kazlıçeşme is open coast, lawns and sea, so Zeytinburnu is inland, brick and concrete with no water. Bakırköy Çarşı is an arcade of shops and a school, so keep these yards free of shopfronts.

---

## H17 · Bakırköy Çarşı

`bakirkoy` · Bakırköy · L81–85 · km 14.0 · Boss: The Principal

**Reads as Istanbul because:** The old shopping arcade, half empty, with dust in the skylight beams. The school next door, with its playground fence. Bakırköy is a Marmaray station on the European side (check the name first).

**Props (ground and street level):** school bell post (gameplay, the defend.bell objective); playground fence (dressing); shopping trolleys (solid, breakable); arcade benches (solid, breakable); planters under the skylight (solid, breakable); closed börek counter (solid, breakable).

**Materials:** Ground: `stone_grey` tile with `paper` cream joints. Walls: `paper` arcade with `tea_amber` trim. Skylight: `bosphorus_blue` glass at low alpha. Accent: `#4F7A62` school door green.

**Signage and text:** Çarşı Kırtasiye Meltem, Kuaför Güzin, Börekçi Nazmiye, Bahar Ortaokulu. TR owner check.

**Light:** Morning: fog, clear, rain, indoor fog, then rain at the office. Daylight through the skylight, dust in the beams, no flashing. Warm skylight light (`simit_gold` at low alpha) over the centre lanes. Cool shadow on the arcade walls (left), `bosphorus_blue`.

**Ambient sound idea:** The school bell, shutters and a trolley's squeak.

**Contrast with neighbours:** Zeytinburnu is inland factory yards with drums, so Bakırköy Çarşı is an enclosed, dusty arcade with shopfronts. Bakırköy Sahil is open to the sea with palms and pastel light, so keep this arcade indoors and beige.

---

## H18 · Bakırköy Sahil

`bakirkoysahil` · Bakırköy · L86–90 · km 15.0 · Boss: The Ice-Cream Man

**Reads as Istanbul because:** The Marmara seafront promenade with cycle lanes, and the ice-cream cart with its bell. A lifeguard tower with no official mark. Palms and benches along the front. Thin in the bible: only the promenade and the tower.

**Props (ground and street level):** ice-cream cart (solid, breakable, the defend.cart objective); benches (solid, breakable); cycle-lane bollards (solid); bins (solid, breakable); palm trees (solid); lifeguard tower (dressing, no official mark); cycle-lane markings (dressing).

**Materials:** Ground: `stone_grey` promenade paving, with cycle lanes in `bosphorus_blue` at low alpha. Walls: `paper` railings. Cart awning: `paper` and `tram_red` stripes. Accents: `#F2B8C6` ice-cream pink and `#A8D8C4` mint.

**Signage and text:** Sahil Dondurma, Bisikletçi Nuri, Gazoz Hacı, Kumsal Kafe. TR owner check.

**Light:** Late morning, pastel. Clear, rain, fog, clear, then cold cloud at stage 5. Warm pastel sun from the palm side (left), `simit_gold` at low alpha. Cool shadow on the cycle lane, `bosphorus_blue`.

**Ambient sound idea:** The ice-cream bell, bicycles and the sea.

**Contrast with neighbours:** Bakırköy Çarşı is an indoor arcade with a skylight and dust, so this hood is open sky, sea and pastel light. Ataköy Marina has masts, pontoons and white hulls, so keep this promenade palm-lined and free of boats.

---

## H19 · Ataköy Marina

`atakoysahil` · Bakırköy · L91–95 · km 16.2 · Boss: The Yacht Owner

**Reads as Istanbul because:** The marina basin and its pontoons, with masts and halyards. Cafés with umbrellas on the quay. No national flags (bible). The bible names no other landmark, so this page is thin.

**Props (ground and street level):** moored boat (gameplay, the boat wait); pontoon planks (dressing; the tilt is proposed); mooring bollards (solid); rope-net stacks (gameplay, the stage 4 traps); gear crates (solid, breakable); café tables with umbrellas (solid, breakable); masts and halyards overhead (dressing, off the walkable area).

**Materials:** Ground: `stone_grey` quay, pontoon decks in `tea_amber` timber. Water: `bosphorus_blue`. Hulls: `paper`. Umbrellas: `paper` and `bosphorus_blue`. Accents: `#3B9C9C` teal water and `#C9A227` brass fittings.

**Signage and text:** Marina Çay Evi, Denizci Malzeme, Halat Atölyesi, Tost Pontonu. TR owner check.

**Light:** Morning: rain, clear, rain, fog, then clear. Morning gold on the hulls (`simit_gold`) from the east (left). Cool shadow under the hulls, `bosphorus_blue`.

**Ambient sound idea:** Halyards tinking on the masts, with gulls and waves on the pontoons.

**Contrast with neighbours:** Bakırköy Sahil is a palm-lined promenade with an ice-cream cart, so this hood is water, boats and no street. Ataköy is beige blocks and courtyards with no water, so keep the white hulls and teal water here.

---

## H20 · Ataköy

`atakoy` · Bakırköy · L96–100 · km 17.0 · Boss: Sayın Abim (the kapıcı)

**Reads as Istanbul because:** Beige stucco blocks with blue shutters and balcony laundry lines. The kapıcı booth in the lobby, since in many Turkish blocks the caretaker lives on site and keeps the keys (postcard, high). The sea from the top floors.

**Props (ground and street level):** laundry lines (dressing, overhang); kapıcı booth light (dressing, story beat W57); shutter terminal (gameplay, hack.gate); planters (solid, breakable); parked cars (solid, breakable); bread crates at the bakery door (solid, breakable); courtyard benches (solid, breakable).

**Materials:** Ground: `stone_grey` courtyard tile and concrete paths. Walls: `paper` stucco with `tea_amber` trim. Shutters: `bosphorus_blue`. Roofs: `night_ink`. Accent: `#D8CBB6` stucco beige.

**Signage and text:** Kapıcı Dairesi, Yıldız Fırını, Blok 7, Mavi Panjur Lokantası. TR owner check.

**Light:** Morning sun on the stucco, with bread steam from the bakery. Warm sun from the courtyard side (right), `simit_gold`. Stage 5 dawn is quiet, not gory. Cool shadow in the stairwell, `bosphorus_blue`.

**Ambient sound idea:** A radio through an open window and a bakery bell. No children appear as zombies.

**Contrast with neighbours:** Ataköy Marina has water and boats, so keep the blocks solid and residential. Chapter 1 ends here. Chapter 2 opens in Ataköy's back streets, which must read as a different, emptier estate.

---

## Build order

1. **H01 İstiklal first.** It is the first arena every player sees, and it sets the template most hoods reuse: the `stone_grey` floor, the generic red tram, and the awning and shopfront rules.
2. **H07 Kapalıçarşı second.** It is the only indoor, lantern-lit arena, so it proves the enclosed-space template, and its shutter terminals are the hardest readability case in the set.
3. **H20 Ataköy third.** It ends the walk with the most facade and laundry detail, so it tests the 3/4 facade work and the overhang fade (§6.5) before Chapter 2 builds on it.

## Decisions taken by the lead (owner may overrule)

1. **Ataköy ambience.** Follow the bible: morning light and a dawn boss arena. The audio cue sheet entry is the one to change.
2. **Zeytinburnu station.** No Marmaray stop; the T1 tram only. Revisit only if the story needs a train.
3. **Hood accents.** Keep the proposed accents as arena-only values in the SVGs. Promote to design-system §3 after the first three hoods are reviewed, so tokens come from art that works, not from a list.
4. **Thin landmarks (H10, H16, H18, H19).** Not blocking. They keep generic dressing now; named landmarks get checked on a map before those hoods are built, after the first three.
5. **Replace or layer.** The authored SVGs replace the canvas ground and facade layers. Procedural props, enemies and effects stay on top, so readability rules do not change.
6. **Breakable simit cart in İstiklal.** Yes, solid and breakable. The 20% simit drop stays, and the pickup keeps its own gold ring so it is not read as dressing.
7. **Turkish sign text.** The owner checks it (he is the TR reviewer). Every sign in this doc is marked "TR owner check".
