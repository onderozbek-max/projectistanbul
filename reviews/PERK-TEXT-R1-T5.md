# Street Tree perk text (R1-T5 step 3): approve or rewrite

> **Status:** approved 2026-11-12 (was a draft) · TR is **proposed**, written in the game's existing words (frenzy = ÇILGINLIK, Dash = Depar, can for HP, sn for seconds, First Aid Kit = İlk Yardım Çantası). TR is the owner's call (D-051): rewrite freely. EN is American English.
> **Limits:** a name has to fit a 52 px node on two lines (about 8 letters a line). A description should fit two lines of the detail panel (about 60 characters).
> **How to answer:** write "ok" or your replacement next to any row. Numbers in the text come from `prototype/js/config-perks.js`; if you change a number there, the text has to change too.
> **Owner decisions (2026-11-12):** the Dash is **Depar** everywhere in TR (HUD, stat, daily modifier, achievement, perks; applied in the strings). Metres are written without a space (`1m`, `1,5m`, `5m`).
> **Owner answers so far (2026-11-12):** `str.1`, `pace.2`, `agg.1`, `int.2`, `grit.4` (TR by the owner; EN names drafted to follow them). The other 19 rows: **ok** (owner, 2026-11-12). All 24 rows are approved and now live in `prototype/js/meta/strings-tree.js`.
> **Renamed since the first list:** `str.2` Cart Shover is now **Blast Shove** (carts never explode in this game, so the old name promised something that does not exist).

| ID | EN name | EN description | TR name | TR description |
|---|---|---|---|---|
| str.1 | Brute Force | Heavy weapons knock enemies back 1 m further. | Kaba kuvvet | Ağır silahlar düşmanı 1m uzaklaştırır. |
| str.2 | Blast Shove | Explosions also shove enemies just outside the blast. | Patlama İtişi | Patlamalar, etki alanının hemen dışındaki düşmanları da iter. |
| str.3 | Shockwave | Every 8th heavy hit sends out a shove ring. | Şok Dalgası | Her 8. ağır vuruş çevreye itme dalgası yollar. |
| str.4 | Wall Breaker | Heavy hits stun armored enemies for 0.5 s. | Duvar Yıkıcı | Ağır vuruşlar zırhlı düşmanı 0,5 sn sersemletir. |
| pace.1 | Quick Feet | Dash clears tea and puddle slows. | Çevik Ayak | Depar, çay ve su birikintisinin yavaşlatmasını temizler. |
| pace.2 | Cat Reflexes | A Dash through 3+ enemies resets 25% faster. | Kedi refleksi | 3+ düşmanın içinden depar, %25 daha çabuk sıfırlanır. |
| pace.3 | Parkour | Puddles and tea never slow you. | Parkur | Su birikintisi ve çay seni yavaşlatmaz. |
| pace.4 | Dolmuş Rider | Your first Dash each level has no cooldown. | Dolmuş Yolcusu | Her seviyedeki ilk deparın beklemesi yok. |
| agg.1 | Killing Spree | Frenzy starts at a 50-kill streak instead of 60. | Seri Katliam | ÇILGINLIK 60 yerine 50'lik seride başlar. |
| agg.2 | Blood Rush | Boss hits extend Frenzy by 0.5 s (up to +4 s). | Kan Hırsı | Patron vuruşları ÇILGINLIK'ı 0,5 sn uzatır (en fazla +4 sn). |
| agg.3 | Finisher | Crit kills slow enemies within 1.5 m. | Bitirici | Kritik öldürme, 1,5m çevredeki düşmanları yavaşlatır. |
| agg.4 | Last Laugh | When Frenzy ends, a shove ring bursts out. | Son Gülen | ÇILGINLIK bitince bir itme dalgası patlar. |
| int.1 | Quick Fingers | Your hacks are quiet: no noise wave. | Hızlı Parmaklar | Hack'lerin sessiz geçer, gürültü dalgası çıkmaz. |
| int.2 | Second Look | Your first lost hack each level keeps its progress. | İkinci Bakış | Her seviyede kesilen ilk hack'in ilerlemesi kaybolmaz. |
| int.3 | Signal Boost | A cell booster marks the next terminal for 10 s. | Sinyal Desteği | Sinyal güçlendirici, sıradaki terminali 10 sn işaretler. |
| int.4 | Backdoor | Traffic-light stun lasts 50% longer. The tram crushes a 50% longer lane. | Arka Kapı | Trafik ışığı sersemletmesi %50 uzar. Tram %50 daha uzun şeridi ezer. |
| cha.1 | Good Name | Rescues need 2.0 s of holding instead of 2.5 s. | İyi İsim | Kurtarmak için 2,5 yerine 2,0 sn basılı tutmak yeter. |
| cha.2 | Friendly Faces | Escorted civilians survive zombie contact 5 s instead of 4 s. | Dost Yüzler | Refakat ettiğin sivil, zombi temasında 4 yerine 5 sn dayanır. |
| cha.3 | Regular | One more free card reroll each level. | Müdavim | Her seviyede 1 ücretsiz kart yenileme hakkı daha. |
| cha.4 | Neighborhood | Every rescue brings you a helper. | Mahalle | Her kurtarma sana bir yardımcı getirir. |
| grit.1 | Thick Skin | The first enemy to hit you each level is stunned for 0.5 s. | Kalın Deri | Her seviyede seni ilk vuran düşman 0,5 sn sersemler. |
| grit.2 | Tea Break | First Aid Kit regen starts after 2 s instead of 3 s. | Çay Molası | İlk Yardım Çantası, canı 3 yerine 2 sn sonra yenilemeye başlar. |
| grit.3 | Iron Stomach | Simit heals 5 more HP. | Çelik Mide | Simit 5 can daha fazla iyileştirir. |
| grit.4 | Stubborn | At 20% HP or less, healing drops fly to you from 5 m. | İnatçı | Canın %20 ve altındayken yiyecekler 5m'den sana uçar. |

## Also needed for the screen (not perk text)
These are small UI strings the Tree screen needs. Drafts, same rules.

| Key | EN | TR |
|---|---|---|
| tree.title | Street Tree | Yetenekler (owner, 2026-11-12) |
| tree.page.fight | Fight | Dövüş |
| tree.page.street | Street | Sokak |
| tree.page.bond | Bond · L20 | Bağ · L20 |
| tree.sc | {n} Street Cred | {n} Sokak Tecrübesi |
| tree.needs | Needs {attr} {n} (you have {m}) · Cost {c} Street Cred | {attr} {n} gerekir (sende {m}) · {c} Sokak Tecrübesi |
| tree.learn | Learn · {c} Street Cred | Öğren · {c} Sokak Tecrübesi |
| tree.learned | Learned | Öğrenildi |
| tree.respec | Respec (free once this chapter) | Sıfırla (bu bölümde bir kez bedava) |
| tree.respecUsed | Respec used this chapter | Bu bölümdeki sıfırlama hakkı kullanıldı |
| tree.hint | Earn Street Cred by fighting | Sokak Tecrübesi için dövüş |

Note: the existing UI already calls Street Cred "Sokak Tecrübesi" (`attr.pool`), and the attribute names are `stat.str` and the rest. I reuse them.
