# Owner visual corrections · 2026-11-18

**Subsequent follow-up:** [neighbor-aware crowd and global portrait identity guard](CROWD-PORTRAIT-GUARD-2026-11-18.md) supersedes direct crowd-variant mapping and the booster fallback in this snapshot. Earlier recordings remain tied to their original build.

Addresses the owner's three screenshot/playback findings after the experiential packet. The prior green suite did not establish visual quality and missed these regressions. This follow-up is view/art only: no combat timing, damage, collision, progression, native voice or story facts changed.

## 1. Bearded portrait and speaker identity

The bearded, knitted-cap portrait is the anonymous restaurant stranger (`ComicRaster` cast-support atlas, `stranger` / `spk.friend`); it is not Arda or Kaan. `coldopen.js` incorrectly selected that actor by panel index for `rule2`, even though all three rules belong to Arda. Memory panels now ask `Story.forLine(id)` for their actual actor and mood, matching current native speaker metadata instead of a positional exception. No TR/EN line was rewritten.

The same portrait is legitimately bound to the anonymous local in the `hood_galata` opening (L6, line `H02i1b`). The shared stranger voice key also serves L17/L27 rescue/guide lines; these are not new Arda appearances. An inventory of comic page character lists found only `hood_galata` explicitly using that stranger portrait outside the opening mistake. Unknown-speaker neutral fallback remains separate from a claimed named identity.

Actual fresh TR and EN opening playback recorded the portrait renderer calls as **Arda / Arda / Arda**. [Turkish three-rule page](media/R1/visual-corrections-2026-11-18/three-rules-tr.png) · [English](media/R1/visual-corrections-2026-11-18/three-rules-en.png).

## 2. Civilian variety

The previous renderer discarded the simulation's existing seeded civilian variant and drew every fleeing person from one restaurant-patron sheet. Restored the variant binding and added **six distinct current illustrated adults, four running frames each**: teal-jacket ponytail, blue-shirt office worker, plum-cardigan woman, older mustard-vest man, orange-jacket messenger and cream-coat woman. Their authored frames keep arms/legs and clothing together; they no longer reuse the one panic pose or a per-leg reconstruction. The restaurant person remains a separate specific actor for stationary restaurant scenes.

Built-in **ImageGen** produced [the new runtime atlas](../prototype/assets/streets/civilian-runners.png) using the existing Arda atlas solely as a style reference. [Exact prompt, source and import notes](../art/commission/generated/2026-11-18-civilian-runners/PROMPT.md); original is in the same folder as `source.png`. The PNG is 2.1 MiB compressed and approximately 6 MiB decoded RGBA; that added texture footprint has not been measured on a physical phone. The source's transparency is retained; the hidden RGB background does not create a rectangle in the game. StreetArt preloads this current atlas and ordinary play never falls back to the retired procedural crowd.

[Ordinary L1 naturally spawned group](media/R1/visual-corrections-2026-11-18/natural-fleeing-crowd-active.png) · [normal-speed group playback](media/R1/visual-corrections-2026-11-18/natural-fleeing-crowd.mp4) · [all-six comparison](media/R1/visual-corrections-2026-11-18/six-civilian-identities.png). The first group used ordinary simulation spawning and automated movement/card clicks: no supplied people, HP, ranks or Second Wind. The all-six lineup explicitly supplies fixed positions for comparison and is not claimed as a natural group.

## 3. Arda's running

The earlier leg rig cut around 60–63% of the image height, above the painted waist, and solved front/back knees outward from an idle frame. It ignored the existing authored running legs. This produced the wide, bent stance reported by the owner.

Arda now uses the existing four illustrated stride poses for side, front and back, timed by actual distance travelled. The entire painted lower silhouette stays intact, joined at its measured waist/hip; there is no front/back two-knee spreading. Torso anticipation/turn/recoil and existing attack/grip ownership remain. During run+attack the upper attack pose can differ from the lower stride; the hip-to-sole shift keeps the ground contact stable. Work arms retain their target reach. Enemy/Kaan rigs were not globally retuned.

[Eight directions at normal speed](media/R1/visual-corrections-2026-11-18/hero-eight-directions-default.mp4) · [minimum quality/reduced motion](media/R1/visual-corrections-2026-11-18/hero-eight-directions-reduced.mp4) · [run with knife/chainsaw/hammer](media/R1/visual-corrections-2026-11-18/run-and-three-weapons.mp4) · [derived source-frame detail](media/R1/visual-corrections-2026-11-18/hero-stride-contact.png).

The isolated movement and combat clips are supplied valid L3 fixtures: quiet lane/position for gait; granted rank3 weapons, high-HP targets and invulnerability for grip stress. They are not earned campaigns or human enjoyment evidence. The natural civilian and fresh opening clips are separately identified.

## Verification and provenance

[New source/build manifest](telemetry/visual-corrections-2026-11-18/build.json) · [capture index](media/R1/visual-corrections-2026-11-18/index.json) · [capture log](telemetry/visual-corrections-2026-11-18/capture.log) · [integrated suite](telemetry/visual-corrections-2026-11-18/full-suite.log).

The prior experiential media index remains its original frozen-build evidence; it is not silently relabelled as footage of these corrections. The follow-up manifest names all nine changed/new runtime files. All seven follow-up recordings are desktop Chrome 390×844 DPR1 at normal speed with real post-master audio; no phone proof is claimed.

Focused `experience`, `scene-art`, `quality` and raster Node checks pass. Added meaningful regressions for stable six-row identity, complete authored lower-body source, painted waist alignment and retained hand mapping. Actual-browser checks assert all three opening portraits in both languages. **Final integrated result: all 49 test groups passed, zero failures.** Source and asset checksums match, all seven recordings contain video and audio, report links resolve, and `git diff --check` passes. Tests establish functional coverage; the actual pictures and normal-speed clips carry the visual evidence.

No new dependency/service, payment integration, plot branch, future-level production, commit/push/merge or message to another chat. The original first-30 independent audit and physical-phone/player gates remain open. This fixes the reported visual regressions; perceived animation quality still requires the owner's playback judgment.
