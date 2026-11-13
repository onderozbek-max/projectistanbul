# TR review: D-060 hoods (Topkapı Sarayı and Haliç–Balat)

Status: **DRAFT, owner review.** Every line below is a native draft (TR written from the beat in Turkish, EN written separately in American English). None carries the approval flag. Reply with the key and your edit, for example `H10p2 TR: ...` or `BK.hd11.3 #2 EN: ...`. `BK.hd10.1 #1` is the first line of that bark pool.

`node prototype/tools/check-hood-keys.js` and `node prototype/tools/test-dialogue.js` pass.

## Conventions

- Barks: 40 characters or less per line (brief). Story pops and captions: 90 or less.
- Arda's "abi" to zombies is mock politeness (voice-tr §2). No "siz" anywhere. Formal "girin" appears only in the Docent's crowd shout.
- Guardrails: no brands, no real state or institution, no religion as a target, no earthquake talk, no body or poverty jokes, no harm to animals, no mocking of Mom or of tourists.
- Joke lines are flagged `j` in the export: H10 has 3 of 9 story lines, H11 has 2 of 8. Each bark pool has one joke line, except BK.hd11.4 (joke-free by design, as its beat metadata says).

## Decisions for you

1. **Boss names (owner check).** The Docent = **Müze Rehberi** (TR). The Antiquarian = **Antikacı** (TR). Both come from `strings-story.js`.
2. **Arda hooks.** H10p2 was "Sıraya girin lütfen. Girmiyor musunuz?" and is now "Abi, sıraya girer misin?" (abi plus a formal ask, no "siz"). H11p3 was "Burada her şey eski ve pahalı. Ben ikisi de değilim." and is now "ya eski ya pahalı ... sadece terliyim" (ends on "just sweaty").
3. **Campfire CMPa (L54).** Caption only, no new speaker. Kaan's tell (wipes hands on the towel before something sincere) carries the gentle beat. CMPb to CMPe are not changed, so Arda's crush line still follows.
4. **Bark length.** The test allows 60 for barks; the brief says 40, so these new hoods are 40 or less. The existing neighbours do not meet 40: in both languages, most hoods have 9 to 15 of their 15 bark lines over 40 characters, up to 60. Confirm 40 is the target; if so, the neighbours need a separate pass (not in this one).
5. **EN sign text.** "Balık Ekmek" stays as the sign's proper name (it is the only Turkish in that line).

## Hood H10 · Topkapı Sarayı (saray) · L46–50

### Story pops and captions

| Key | TR draft | EN draft | Note |
|---|---|---|---|
| H10b (boss, Docent) | Sıraya girin! Flaş yasak, dokunmak yasak, koşmak da yasak. | Behind the rope, please. The rope has outlasted several empires. | Museum-rules voice. "Girin" is a crowd shout. |
| H10i1a (caption, names hood) (j) | Topkapı Sarayı. Müze kapandı ama kuyruk hâlâ açık. | Topkapı Palace. Plane trees, a ticket booth, and zero tickets sold today. | Understatement: the museum shut, the queue did not. |
| H10i2a (Kaan) | Saray bu mu abi? Çay ocağı kapalı, simitçi yok. Kıyamet ciddi! | Who runs this place? Not one guy yelling about simit. Unbelievable, man. | Food first: no tea stand, no simit seller. |
| H10i2b (Arda) (j) | Annem bizi buraya götürecekti. Sıraya girmemek için kaçtım. Sıra beni buldu. | Mom dragged me here at nine. I skipped the line then too. Old habits. | He dodged the queue as a kid; now the queue has him. |
| H10i3a (Arda) | Önde rehber, bayrağı yukarıda. Arkada biz. Tur ücreti yok, en azından. | Up front, a guide with a flag and an umbrella. Apparently we're the group. | Stuck in the tour group; at least it is free. |
| H10p1 (Kaan, stage 1 gate square) | Bariyere çarptım, özür diledim. Bariyer de bana bakmadı. Ayıp abi! | Sorry, stanchion. Didn't see you. You okay? | Kaan apologizes to furniture (cast-sheet habit). |
| H10p2 (Arda, stage 2 Gülhane path, zombie hook) (j) | Abi, sıraya girer misin? Girmiyorsun. Tamam, anlaşıldı. | Buddy, would you mind getting in line? No? Okay. Fair enough. | Mock politeness to zombies; the proposal's hook, rewritten. |
| H10p3 (Kaan, stage 3 ticket queue) | Bariyerler baklava gibi tek sıra dizmiş. Yavaş, tatlı, yapışkan. | Barriers got us in neat rows, like baklava. I could eat the whole tray. | Food metaphor for the barrier lanes. |
| H10p4 (Arda, stage 4 rain) | Yağmur başladı. Saray kuru kaldı, biz değiliz. Adalet yok. | It's raining. The palace has eaves. We have bad luck. | Dry self-pity: the palace stays dry, we don't. |

### Bark pools (stage 1 to 5)

| Key | TR draft | EN draft | Note |
|---|---|---|---|
| BK.hd10.1 #1 | Topkapı. Çınarlar, taş meydan, kuyruk. | Topkapı. Shade under the plane trees. | Stage 1 scene; names the hood. |
| BK.hd10.1 #2 (j) | Dünya bitti, hediyelikçi hâlâ satıyor. | Magnets, half off. End-of-world sale. | The souvenir seller keeps trading after the world ends. |
| BK.hd10.1 #3 | Sesli rehber cızırdıyor. Dinleyen yok. | Audio guide's stuck on the gate spiel. | The audio guide talks to nobody. |
| BK.hd10.2 #1 | Sis parkı yutmuş. Yol nerede? | Thick fog. The path's a suggestion now. | Gülhane fog. |
| BK.hd10.2 #2 (j) | Çay ocağı kapalı. Tek lüksüm oydu. | Tea stand's dark. Guess I quit tea. | The closed tea stand was his one luxury. |
| BK.hd10.2 #3 | Bankta biri var. Oturmuş, kalkmıyor. | Bench has a tenant. Very committed. | A zombie that sat down and will not get up. |
| BK.hd10.3 #1 | Bariyerler tek sıra yaptı. Girdik. | Barriers sorted us. Thanks, barriers. | Stage 3: barriers funnel the lanes. |
| BK.hd10.3 #2 | Kuyruk köşeyi dönmüş. Sarmış bizi. | The line bends at the corner. So do we. | The queue wraps the walls and wraps us. |
| BK.hd10.3 #3 (j) | Bilet almak için girdik. Bilet yok. | No ticket. Very efficient of us. | Went in for a ticket; there are none. |
| BK.hd10.4 #1 | Şemsiye kimde? Kimsede yok. | Rain now. Umbrellas are a rumor. | Stage 4 rain; nobody has an umbrella. |
| BK.hd10.4 #2 | Derzlerde su birikmiş. Basarsan sıçrar. | Water in every crack. Watch your feet. | Puddles in the stone joints. |
| BK.hd10.4 #3 (j) | Yağmurda zombiler de yavaşladı. Şans bu. | Rain slows them. Finally, a fair fight. | Rain slows the zombies; Arda gets the luck. |
| BK.hd10.5 #1 | Şemsiye açıldı. Bayrak öne çıktı. | Umbrella up, flag out. Here he comes. | Stage 5: the boss arrives with umbrella and flag. |
| BK.hd10.5 #2 | Saray Kapısı. Bayrak tepede. | Tower gate. The flag's up top. Not us. | The flag is on top of the gate tower. |
| BK.hd10.5 #3 (j) | Müze Rehberi geliyor. Bayrağı kır. | Flag first. Then the guide. Orderly. | Boss-fight instruction: break the flag. |

## Hood H11 · Haliç–Balat (halic) · L51–55

### Story pops, captions and campfire

| Key | TR draft | EN draft | Note |
|---|---|---|---|
| H11b (boss, Antikacı) | Lambaya dokunma! Vazo üç yüz yıllıktı. Şimdi dört parça, değeri dörtte bir. | That vase was four hundred years old. Now it's shards. Collectible, sort of. | The dealer's arithmetic: the vase is worth a quarter in pieces. |
| H11i1a (caption, names hood) | Haliç–Balat. Mavi saat. Boyalı evler, her balkonda bir çamaşır ipi. | Haliç–Balat. The Horn's gone navy, and the houses haven't gotten the message. | Blue hour, painted houses, laundry. |
| H11i2a (Arda) (j) | Antikacılar. Camda eski telefonlar. Benimki de sinyal arıyor, hâlâ. | Antique shops. Rotary phones in the window, all dead. Like mine, basically. | His phone is also hunting for signal. |
| H11i3a (caption) | Garajın kapısı aralık, içeride ışık var. Tabelanın yarısı boyalı. | The garage is open a crack, and someone's still up. | Sets up Fatma Nine's garage; the sign is half-painted. |
| H11p1 (Arda, stage 1 shore) | Haliç sakin. Özçekim çekecek kimse kalmamış. Turizm bitti. | The Horn's calm. Perfect view, and nobody left to post it. | Blue hour with no one left to take a photo. |
| H11p2 (Kaan, stage 2 colour houses) | Pembe ev lokum gibi duruyor. Lokum da bu kadar hırıltı yapmaz! | Sorry, laundry line. Sorry, balcony. Sorry, pink house. Keep moving, big guy. | TR: food metaphor. EN: his apologize-to-furniture habit. Different jokes on purpose. |
| H11p3 (Arda, stage 3 antique lane) (j) | Burada her şey ya eski ya pahalı. Ben ikisi de değilim, sadece terliyim. | Everything on this lane is either antique or overpriced. I'm the third option. | The proposal's hook, rewritten. "Neither", then the sweaty punchline (TR) or "third option" (EN). |
| H11p4 (Kaan, stage 4 garage) | Abi, tabela yarım. Nine 'bitir şunu' derdi. Bir dahaki sefere, söz. | The sign's still half-done. I can hear her from here: 'Finish it, Kaan.' | Gentle, no joke on purpose (pool BK.hd11.4 is also joke-free). |
| CMPa (campfire caption, L54) | Duvarda yarım boyalı tabela: Fatma Nine Balık Ekmek. Kaan elini havluya siliyor. | Fatma Nine Balık Ekmek, half-painted on the wall. Kaan's hands go to his towel. | Caption only. The sign plus Kaan's towel tell. Replaces the old bakery line. |

### Bark pools (stage 1 to 5)

| Key | TR draft | EN draft | Note |
|---|---|---|---|
| BK.hd11.1 #1 | Haliç–Balat. Tepede boyalı evler. | Haliç–Balat. Steep, and very colorful. | Stage 1 shore; names the hood. |
| BK.hd11.1 #2 | Çamaşır ipleri asılı. Toplayan yok. | Laundry's out. Nobody's bringing it in. | Laundry on the lines, nobody collecting. |
| BK.hd11.1 #3 (j) | Haliç masmavi. Güzel. Yanlış zamanda. | Blue hour on the Horn. Wrong decade. | Pretty view, wrong time. |
| BK.hd11.2 #1 | Sis suyun üstünde. Duvarlarda renk. | Fog on the Horn. Painted walls, no one. | Stage 2: fog and colour. |
| BK.hd11.2 #2 (j) | Pembe, sarı, mavi. Biri zevkli olmuş. | Pink next to ochre. Nobody's arguing. | Someone had taste; the zombies don't care. |
| BK.hd11.2 #3 | Kafe sandalyeleri merdivende dizili. | Café chairs stacked, waiting for guests. | Café chairs on the steps. |
| BK.hd11.3 #1 | Antika her yerde. Alıcı yok. | Old stuff on every step. Zero bidders. | Stage 3 antique lane. |
| BK.hd11.3 #2 (j) | Raflar sokağı kapatmış. Sıkış bakalım. | Shelves on the lane. Climb or squeeze. | Shelves block the lane. |
| BK.hd11.3 #3 | Mangal devrilmiş, ateş yayılıyor. | Brazier tipped. Fire's having a moment. | Toppled brazier in stage 3 (no earthquake imagery). |
| BK.hd11.4 #1 | Fatma Nine'nin garajı. Bu sefer sessiz. | Fatma Nine's garage. Finally, a break. | Stage 4, quiet. No joke on purpose (pool is joke-free). |
| BK.hd11.4 #2 | Tabela yarım. Kaan bakmamaya çalışıyor. | Kaan keeps not looking at the sign. | Kaan's tell, gently. |
| BK.hd11.4 #3 | Çamaşır damlıyor. Çay kokusu, nihayet. | Wet sheets, and somebody's brewing tea. | Tea smell: a good moment. |
| BK.hd11.5 #1 | Balat iskelesi. Lamba hâlâ sallanıyor. | Chain lamp swinging. Ominous, classy. | Stage 5 pier; the chain lamp. |
| BK.hd11.5 #2 | Yağmur iskelede. Ayaklar kayıyor. | Rain on the boards. Everyone's slipping. | Rain on the pier. |
| BK.hd11.5 #3 (j) | Eşya yağıyor. İndirim değil bu. | Stock's falling. This isn't a sale. | Falling stock (phase 3) is not a sale. |

## Out of scope in this pass

- Stage names, hood blurbs, signs and meta lines (strings files), and the comic-page text for CMPb to CMPe (unchanged).
- The EN Antiquarian pop does not mention the lamp; say if you want it there.

## Owner review result (2026-11-13)
- Approved as drafted, or replaced with the owner's own Turkish (13 lines: H10i1a, H10i2a, H10i2b, H10p1, BK.hd10.1 #2, BK.hd10.3 #1, BK.hd10.4 #2 and #3, BK.hd10.5 #3, H11b, H11p1, H11p2, H11p4). All other lines approved; they carry `ok: 1`.
- H10i2b: the owner's line was 93 characters against the 90 limit, so "buraya" was dropped ("Annem çocukken beni getirdiğinde de kuyrukta beklememek için kaçmıştım. Bugün de aynı.").
- EN lines were adjusted to follow the owner's meaning where it changed (H10i1a, H10i2b, H10p1, H11b, H11p1, BK.hd10.4 #2, BK.hd10.5 #3).
- **Closed (owner ok 2026-11-13):** H10p4 (stage 4 rain). The owner did not follow the draft. New proposal, not yet approved: TR "Yağmur bastırdı. İçerisi kuru ama bilet yok." / EN "It's pouring. Dry inside, but there's no ticket."
