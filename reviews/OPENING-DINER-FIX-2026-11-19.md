# Opening: invisible converted diner

Owner-reported defect reproduced on Audit8 runtime `81a885795a562dd930b3428f5531548de69f03b6119ba7c2e4d19d5e587c3ce3`.

The cutscene freezes the simulation's enemy age at zero and supplies a fresh view projection while the diner approaches. The ordinary spawn wrapper therefore kept rendering him at half size/opacity and emitted new spawn dust every frame over his body. His depth ordering also used his original seat, and the completed approach reverted to the human turning pose. The frozen hit flash could persist throughout the outro.

The fix treats seated diners as existing residents, so they do not scale/fade in or regenerate spawn dust. Real newly spawned enemies retain their current entrance. One scene-projected actor position now governs culling, shadow, body and depth; Arda's projected feet govern furniture ordering during the opening. Conversion remains a zombie through the strike, with the short existing hit-flash duration measured on the cutscene clock. The diner atlas starts decoding at the menu. No simulation-clock advance, collision, weapon/balance, native dialogue, Arda gait, civilian identity or new asset is involved.

**Current local build:** `1ef652232e6ad81670cc862f0809877cefecea25e7129257b9231c8354de32b1`, 1,125 runtime files. [Build metadata](telemetry/audit8-implementation/opening-fix-final-build.json) · [runtime hashes](telemetry/audit8-implementation/opening-fix-final-build-runtime.sha256) · [exact follow-up checks](telemetry/opening-diner-fix-2026-11-19/checks.json). Served at `http://127.0.0.1:8785/?lang=tr&fix=opening-diner`. The preceding Audit8 snapshots/movies retain their original identities.

Separate dialogue/comic edits arrived in the shared workspace after this snapshot was frozen. They remain untouched and are listed in the checks file; this server/recording does not claim to include or verify that concurrent work. The four files changed by this fix still match its frozen source exactly.

**Verified:** opening, experience, scene-art, quality and art-raster groups all pass, zero failures. The new behavioral regression fails on the old completed-approach state and also protects resident scale/opacity/dust, ordinary spawn effects, frozen clocks and hit-flash release. JS syntax and `git diff --check` pass. [Focused log](telemetry/opening-diner-fix-2026-11-19/focused.log).

The [31-second normal-speed opening](media/R1/opening-diner-fix-2026-11-19/opening-conversion.mp4) uses a fresh desktop browser, actual Start and movement keys, original timestamps and real post-master audio. No time skip, supplied actor/power or outcome. [Trace/provenance](media/R1/opening-diner-fix-2026-11-19/index.json): 88 samples, full opacity/scale, zero spawn-dust emissions during the opening, zero browser errors; actual post-scene movement from y−6.5 to y−4.10 in 0.7 simulation seconds. Frames were inspected through conversion, approach, strike and recovery. Before stills retain the instrumented reproduction's provenance in the checks file.

This small view-only follow-up uses focused verification; the earlier 50-group full suite remains attached to its earlier source snapshot, not this fix. No physical-phone acceptance claimed. No commit, push, merge, dependency or service.
