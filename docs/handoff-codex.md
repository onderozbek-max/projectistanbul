# Handoff to Codex (ChatGPT app): implementation agent for Project Istanbul

Written 2026-11-14 by the previous implementation agent (Wibey Desktop, Claude) for the next one (Codex). It holds what the code and the other docs do not:
the current state, the traps, the owner's working rules, and what is only on this Mac. If something here and a doc disagree, the doc wins (AGENTS.md rule),
then tell the owner.

## 1. What is active (read this before AGENTS.md's Godot parts)

- **The active build is the JS prototype in `prototype/`** (plain JS, no build step). `docs/execution-plan.md` section R1 ("Prototype Revision") is the live plan.
  The Godot milestones M0 to M6 in the same file and in AGENTS.md describe the long-term target. They are paused: **do not start M0 or touch `game/`** unless the owner says so.
- Branch **`r1/t2-art-direction`**, 48 commits ahead of `main`, all pushed to `origin` (`https://github.com/onderozbek-max/projectistanbul.git`). Not merged and no PR open.
  Never push to `main`, merge, force-push or rewrite history without the owner asking. Last commits: `8dd4037` raster world and items, `c1ba874` raster characters, `5f7ad00` importer and 212 assets.
- The owner is **Onder Ozbek**: directs the game, plays it on an iPhone, does not read code. He writes Turkish and English. He pays for and generates assets himself (Suno music, an AI sound tool, ChatGPT images) from prompts you write.

## 2. How to run, test and balance

```bash
cd prototype && python3 tools/serve.py          # port 8765, no-cache. Phone: http://<mac LAN ip>:8765/?fps=1&debug=1  (the Mac was 192.168.4.21)
node tools/bot.js --level=5 --seeds=8           # headless balance bot; --levels=2,5,12 for a table; --campaign=30 --out=f.jsonl for L1-30 through the meta layer
tools/run-tests.sh                               # from prototype/: every test, one at a time, reruns a failure once. Pass names to run some: run-tests.sh art-raster fonts
```
- URL flags: `?fps=1` frame and audio overlay (ends with `aud <ctx state>/<session> m:<track>`), `?debug=1` telemetry export button, `?art=raster` ChatGPT art, `?seed=N`, `?mastery=N`, `?seg=B`.
- **The full suite takes about 20 minutes** (`test-modes` and `test-meta` are the slow ones). While working, run only the tests your change can touch.
- **Chrome tests flake under load** (`test-map-first-run`, `test-enemy-silhouettes`, `test-art-raster`, `-world`, `test-arena-evolve`): rerun one alone before believing a failure. Chrome path: `/Applications/Google Chrome.app/...` or `CHROME_BIN`.
- `test-modes` holds golden Normal-mode traces: if a sim change moves them, that is a balance change and must be noted under Deviations.
- Pre-existing, not yet fixed: `objectives-hud.js drawMarkers` reads `R.cam` before the first frame in a story run (throws with or without `?art=raster`).
- Tools: `node` 20+ (24 here), `ffmpeg` and `ffprobe` (Homebrew, used by `prepare-music.js` and `prepare-sfx.js`), Chrome, Python 3. This Mac has no `timeout` or `rg`; the shell is zsh (unquoted variables do not word-split).
- Sandbox note: the browser tests, `serve.py` and the audio tools need local processes and ffmpeg. If your sandbox blocks them, say so instead of skipping them silently.

## 3. Rules of the prototype (tests enforce most of them)

- **Sim and view are separate.** `prototype/js/sim/` is deterministic, reads only `P.CFG` and never reads the view, `P.Settings` or quality. `js/view/` draws. Art, audio, shake and text changes are view only and must not move a sim trace.
- Numbers live in `js/config*.js`. No magic numbers in the sim. Player text lives in `js/strings*.js`, `js/dialogue/` (voice lines, written natively per language, **never translate a voice line**, D-051) and `js/story/`. Turkish casing goes through the text utility.
- Files <= 600 lines (`view/screens.js` is at 597: split before adding). Namespace `P`, ES5-style IIFEs, scripts listed in `index.html` in load order. New view files must also be known to the Node loaders (`tools/lib-load.js` skips view files by design; tests load the ones they need).
- Guardrails (narrative.md): no real state actors, earthquake imagery, religion or politics as targets, real brands or club crests, flags, or more than 3 flashes a second. `tools/check-banned.js` and `test-art-prompts.js` check part of it.
- No secrets, no new dependency, no paid service, no remote tunnel without asking (`reviews/QUESTIONS.md`).

## 4. Owner working rules (learned the hard way)

- **"Whatever you recommend" delegates the decision, it does not skip the record.** Decide, log it in `docs/product.md` section 17 (D-0xx), and say so in the report.
- **Commit and push only with the owner's go-ahead.** He has said "commit or push, whatever you recommend" this round; ask again for anything new. Commit messages: `r1/t5: ...`.
- **Turkish text goes to him as a table** (key, TR, EN, where it appears) for review. `reviews/TR-REVIEW-R1-T4.md` is the open one.
- **Report plainly:** what you did, what you saw in screenshots (look at them: Read the PNG), what is unverified. Do not say "works on the phone" unless he confirmed on the phone. He reports phone problems by screenshot and by the telemetry JSONL he pastes.
- Update `reviews/REVIEW-R1.md` (template in execution-plan.md 5.2) after each step; it is the running log. Put open decisions in `reviews/QUESTIONS.md`.
- Phone testing: he found real bugs this way (music overlap, silent-switch mute, dead stick zone). Prefer the phone over assumptions, and add a test for each bug.

## 5. State of the work (2026-11-14)

Done and pushed this round: audio assets wired (Suno music with a loop-tail workaround, generated SFX), Nightmare and Night Shift modes (D-065), pacing package (D-064), stick fix (spawn anywhere), first-run map fix, fonts, streak-word throttle (`VAHŞET`), telemetry persistence and export, arena evolution, enemy looks, weapon tiers (all code-drawn), the 419 ChatGPT prompts, the importer, and the raster runtime.

**Pending owner decisions:** accept **D-066** (raster art route, proposed); confirm music plays on the iPhone (iOS silent-switch fix is unverified on a device); review `reviews/TR-REVIEW-R1-T4.md`; regenerate `prototype/audio/sfx-gen` uiTap (rejected by `prepare-sfx`, so the cue is still synthesized).

**Next build steps:** (1) the owner judges `?art=raster` on the phone and sends frame time from `?fps=1` (decoded atlases are about 85 MB for characters alone, above the 64 MB sprite budget: not measured on iOS); (2) weapon visuals on the new tier art once he has seen it; (3) HP and death data in `level_end` telemetry; (4) fix the regenerate list below as ChatGPT assets arrive (`prepare-art.js` is re-runnable).

**Known issues, not fixed:** colourblind palettes do not exist in the view; the Istiklal badge sits under the tab row; HUD HP float; objective chips overlap the results title; map tab row overflows at 150% text; bot medians for Nightmare and Night Shift swing with the sample and Normal pacing is about 4.1 min a level against a 5 to 5.5 target (owner's real run: 4.3 min, 1902 kills); arena frame cost +1% to +9% p95 in a loaded run, not measured on a device.

## 6. The art pipeline (ChatGPT is the artist, you are the importer)

1. `art/commission/chatgpt/` holds the workflow: `README.md` (how the owner runs it), `PROJECT-INSTRUCTIONS.md`, `STYLE-BIBLE.md`, `prompts/<batch>/*.md` (**419** prompts, one per asset, generated from the game's own config by `prototype/tools/gen-art-prompts-characters.js` and `gen-art-prompts-world.js`; re-run them, never hand-edit a generated prompt), `ORDER-*.md`, and `art/commission/TRACKER.csv` (status per prompt).
2. The owner saves ChatGPT's PNGs to `art/commission/in/<batch>/<name>.png` (**git-ignored, 211 MB, only on this Mac**). The art-side spec you must follow is `art/commission/IMPLEMENTATION-HANDOFF.md` plus `asset-inventory.json` (copied from `/Users/o0o02dn/Documents/ChatGPT/istanbul art/asset-handoff/`, which also holds the originals and contact sheets).
3. `node prototype/tools/prepare-art.js` (see `art/commission/IMPORTER.md`) keys out the magenta or cyan background, splits sheets, packs atlases into `prototype/assets/art/` and writes `manifest.json` (schema 1, committed; 212 files, 27.6 MiB of a 60 MiB budget). Intermediates go to `art/commission/ready/` (git-ignored).
4. Runtime, all behind `?art=raster` with the code art as the fallback: `js/view/art-raster.js` (loader), `art-raster-chars.js`, `art-raster-world.js` (ground and facades), `art-raster-items.js` (props, vehicles, gems, icons). Tests: `test-art-raster`, `-world`, `-items`, `test-prepare-art`, `test-art-prompts`. Style: "Ink & Tea", #14151F outline, flat cel shading, warm light from the upper left, camera about 55 degrees, figures face right and the game mirrors them.
5. **Regenerate list** (asks for ChatGPT, details in `reviews/REVIEW-R1.md` part 20): boss_vatman and boss_bigbro at 512; boss attack and hurt frames (66 to 84% of idle height, bosses shrink); gnd_halic_steps and the feature tiles (seams); body-only weapon tiers (baked trails swamp the silhouette at 40 px); the tram (2.7:1 against the prompted 4.3:1); Istiklal bin, bollard and barrier props; grip anchors for held weapons; off-centre vehicle pivots. Missing prompts: hack terminals, buses, fauna.
6. Hand-wired Galata, Bridge and Saray props are older SVG atlases (`handwired: true` in the manifest) and are not emitted by the importer.

## 7. Audio pipeline

`prepare-music.js` and `prepare-sfx.js` turn the owner's drops into the tracked game files (`prototype/audio/music/*.mp3`, `sfx/`). Sources are **git-ignored and only on this Mac**: `prototype/audio/music-suno/` (Suno exports), `prototype/audio/sfx-gen/` (generated SFX). The Suno loops lack the 1.5 s crossfade tail, so `prepare-music.js` time-stretches up to 2% (or pads a stinger up to 0.5 s). iOS: `HTMLAudioElement.volume` is ignored, so music runs through Web Audio gain nodes; the silent switch mutes Web Audio, handled with `navigator.audioSession.type='playback'` plus a silent looping element, started from a gesture (`view/sfx.js`, `view/music.js`). `prototype/audio/music-procedural/` is an untracked backup of the old procedural tracks; nothing references it (they are also in git history).

## 8. What exists only on this Mac (not in git)

| What | Where | Size | If lost |
|---|---|---|---|
| ChatGPT source PNGs | `art/commission/in/` and `/Users/o0o02dn/Documents/ChatGPT/istanbul art/` | 211 MB and 104 MB | The committed atlases still run the game, but new imports and re-cuts need the sources |
| Suno originals, SFX WAVs | `prototype/audio/music-suno/`, `prototype/audio/sfx-gen/` | 38 MB, 3 MB | Committed mp3s still play; re-prep needs the originals |
| Full history of the previous agent's work | `/Users/o0o02dn/.claude/projects/-Users-o0o02dn-Documents-istanbul/*.jsonl` | | Grep it for the reasoning behind any decision |
| Owner's telemetry pastes | `/Users/o0o02dn/.wibey/temp/pastes/` | | One run is summarised in REVIEW-R1 part 19 |

**Owner action: back up the first two rows** (a zip to cloud or an external disk). They are the only copies; git does not hold them.

## 9. Handoff check (do this first; if you cannot answer from the repo, the handoff is lossy: tell the owner what is missing)

1. Which build is active, which branch, and may you merge it? 2. What does `?art=raster` change and what happens when an atlas is missing? 3. How do you run only the art tests, and which tests flake? 4. Where do player-visible strings go, and why must a voice line never be translated? 5. What makes a change "view only"? 6. Where do the raw ChatGPT images live and are they in git? 7. What does the owner mean by "whatever you recommend", and what must you still do? 8. What is D-066 and who must accept it? 9. Name three items on the regenerate list. 10. Which decisions are waiting on the owner?

Then: run `prototype/tools/run-tests.sh art-raster art-raster-world art-raster-items fonts quality`, start `serve.py`, open `?art=raster&fps=1` in a browser, and read `reviews/REVIEW-R1.md` from "R1-T4 part 19" to the end.
