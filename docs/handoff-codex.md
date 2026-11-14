# Handoff to Codex (ChatGPT app): implementation agent for Project Istanbul

Written 2026-11-14 by the previous implementation agent (Wibey Desktop, Claude) for the next one (Codex). It holds what the code and the other docs do not:
the current state, the traps, the owner's working rules, and what is only on this Mac. If something here and a doc disagree, the doc wins (AGENTS.md rule),
then tell the owner.

**Next:** read `reviews/EXPERT-REVIEW-2026-11-14.md` (audit and roadmap). Its Phase 0 replaces the "Next build steps" in section 5 below.

## 1. What is active (read this before AGENTS.md's Godot parts)

- **The active build is the JS prototype in `prototype/`** (plain JS, no build step). `docs/execution-plan.md` section R1 ("Prototype Revision") is the live plan.
  The Godot milestones M0 to M8 in the same file and in AGENTS.md describe the long-term target. They are paused: **do not start M0 or touch `game/`** unless the owner says so.
- **Git truth (end of 2026-11-14 handoff).** Work branch `r1/t2-art-direction`, pushed: its tip equals `origin/r1/t2-art-direction`, so nothing is unpushed. Recheck any time:
  `git fetch origin && git status -sb && git rev-list --count origin/main..HEAD && git for-each-ref --format='%(refname:short)' refs/heads`.
  - At the handoff the branch was about 80 commits ahead of `origin/main` (and about 53 ahead of local `main`). Local `main` has 27 commits that are not on `origin/main`; all 27 are already contained in this branch, so they are safe on GitHub.
  - A PR must target **`origin/main`**, and the owner approves it. No PR is open. `gh` is not logged in to github.com (see section 10).
  - Remotes: `origin` = `https://github.com/onderozbek-max/projectistanbul.git` (use this). `old-origin` = `https://github.com/onderozbek-max/istanbul.git` (older; do not use).
  - Every local branch is fully contained in HEAD: `main`, `r1/birds-cats`, `r1/enemy-cap`, `r1/enemy-fixes`, `r1/enemy-wave1`, `dialogue/two-native-scripts`, and `dialogue/comics-patch`.
  - `dialogue/comics-patch` (owner-approved 2026-11-10) had never been merged. It was merged on 2026-11-14 in commit `4007a47`: a conflicted line took the patch's approved wording only where the active line still had the old wording; later owner decisions (D-058, D-060, the 2026-11-12 TR rewrites) were kept. Four lines need the owner (`reviews/QUESTIONS.md`, 2026-11-14 "comics patch").
  - Commits `5f7ad00`, `c1ba874` and `8dd4037` (art: R1-T2 and D-066) carry the label `r1/t5:`. R1-T5 is the Street Tree skill tree. History is not rewritten.
  - Most commits since 2026-11-08 carry the trailer `Co-Authored-By: Wibey Desktop <wibey@walmart.com>` (see section 10).
- **Labels.** R1 tasks T0 to T7 are in `docs/execution-plan.md` R1. `reviews/REVIEW-R1.md` "parts" are a running log, numbered loosely (part 20 is art, not T5). New work uses the roadmap phases of `reviews/EXPERT-REVIEW-2026-11-14.md` section 6: branch `r1/p0.1-<slug>`, commit prefix `r1/p0.1:`.
- Never push to `main`, merge, force-push or rewrite history without the owner asking.
- The owner is **Onder Ozbek**: directs the game, plays it on an iPhone, does not read code. He writes Turkish and English. He pays for and generates assets himself (Suno music, an AI sound tool, ChatGPT images) from prompts you write.

## 2. How to run, test and balance

```bash
cd prototype && python3 tools/serve.py          # port 8765, no-cache. Phone: http://<mac LAN ip>:8765/?fps=1&debug=1  (the Mac was 192.168.4.21)
node tools/bot.js --level=5 --seeds=8           # headless balance bot; --levels=2,5,12 for a table; --campaign=30 --out=f.jsonl for L1-30 through the meta layer
tools/run-tests.sh                               # from prototype/: every test, one at a time, reruns a failure once. Pass names to run some: run-tests.sh art-raster fonts
```
- URL flags: `?fps=1` frame and audio overlay (ends with `aud <ctx state>/<session> m:<track>`), `?debug=1` telemetry export button, `?art=raster` ChatGPT art, `?seed=N`, `?mastery=N`, `?seg=B`.
- **The full suite takes about 20 minutes** (`test-modes` and `test-meta` are the slow ones). Run it in the background (`prototype/tools/run-tests.sh > /tmp/suite.log 2>&1 &`). While working, run only the tests your change can touch.
- **Chrome tests flake under load** (`test-map-first-run`, `test-enemy-silhouettes`, `test-art-raster`, `-world`, `test-arena-evolve`): rerun one alone before believing a failure. Chrome path: `/Applications/Google Chrome.app/...` or `CHROME_BIN`.
- `test-modes` holds golden Normal-mode traces: if a sim change moves them, that is a balance change and must be noted under Deviations.
- Pre-existing, not yet fixed (read from the code, not reproduced): a story run can throw before the first frame. `objectives-hud.js` `drawMarkers` (call near line 83) calls `P.Render.toScreen`, which reads `R.cam.ox` at `render.js:18`. `R.cam` is set only in `R.frame` (`render.js:214`), so a call before the first frame reads a property of `null` (`R.cam` starts as `null`, `render.js:2`). The crash is outside the raster path. Fix in Phase 0.5.
- Tools: `node` 20+ (24 here), `ffmpeg` and `ffprobe` (Homebrew, used by `prepare-music.js` and `prepare-sfx.js`), Chrome, Python 3. This Mac has no `timeout` or `rg` binary (agent shells may define an `rg` function; use `grep`). The shell is zsh (unquoted variables do not word-split).
- Sandbox note: the browser tests, `serve.py` and the audio tools need local processes and ffmpeg. If your sandbox blocks them, say so instead of skipping them silently.

## 3. Rules of the prototype (tests enforce most of them)

- **Sim and view are separate.** `prototype/js/sim/` is deterministic, reads only `P.CFG` and never reads the view, `P.Settings` or quality. `js/view/` draws. Art, audio, shake and text changes are view only and must not move a sim trace.
- Numbers live in `js/config*.js`. No magic numbers in the sim. Player text lives in `js/strings*.js`, `js/dialogue/` (voice lines, written natively per language, **never translate a voice line**, D-051) and `js/story/`. Turkish casing goes through `P.upper` (`js/strings.js`), never `toUpperCase()`.
- Files <= 600 lines (`view/screens.js` is at 597: split before adding). Already over: `view/sfx-bank2.js` (678), `view/istanbul-props2.js` (627), `view/sfx-bank.js` (609), and five tool or test files (`tools/gen-art-prompts-world.js` 1080, `gen-art-prompts-characters.js` 894, `prepare-art.js` 780, `lib-art-image.js` 699, `test-arsenal.js` 601). Splits are Phase 0.5. Namespace `P`, ES5-style IIFEs, scripts listed in `index.html` in load order. New view files must also be known to the Node loaders (`tools/lib-load.js` skips view files by design; tests load the ones they need).
- Guardrails (narrative.md): no real state actors, earthquake imagery, religion or politics as targets, real brands or club crests, flags, or more than 3 flashes a second. `tools/check-banned.js` and `test-art-prompts.js` check part of it.
- No secrets, no new dependency, no paid service, no remote tunnel without asking (`reviews/QUESTIONS.md`).

## 4. Owner working rules (learned the hard way)

- **Owner intent is in two files.** `reviews/OWNER-LEDGER.md` lists every owner instruction since 2026-11-08 and where it lives; later entries win. `reviews/owner-messages-archive.md` holds his own words, verbatim, including his answers in question boxes (telemetry pastes and pasted assistant text are omitted and marked). If the ledger and a doc disagree, ask the owner.

- **"Whatever you recommend" delegates the decision, it does not skip the record.** Decide, log it in `docs/product.md` section 17 (D-0xx), and say so in the report.
- **Commit and push only with the owner's go-ahead.** His "commit or push, whatever you recommend" covered the previous agent's round only: ask before each push in your work, and never merge without his explicit OK. Commit messages: `r1/p<phase>.<task>: ...` (AGENTS.md).
- **Do not wait for his music, or for telemetry, before other progress** (2026-11-13). He sends both when he can.
- **He asked for the percent of implementation done and what is left** (2026-11-10). No figure is recorded yet: give one in your first report.
- **Turkish text goes to him as a table** (key, TR, EN, where it appears) for review. `reviews/TR-REVIEW-R1-T4.md` is the open one.
- **Report plainly:** what you did, what you saw in screenshots (look at them: Read the PNG), what is unverified. Do not say "works on the phone" unless he confirmed on the phone. He reports phone problems by screenshot and by the telemetry JSONL he pastes.
- Update `reviews/REVIEW-R1.md` (template in execution-plan.md 5.2) after each step; it is the running log. Put open decisions in `reviews/QUESTIONS.md`.
- Phone testing: he found real bugs this way (music overlap, silent-switch mute, dead stick zone). Prefer the phone over assumptions, and add a test for each bug.

## 5. State of the work (2026-11-14)

Done and pushed this round: audio assets wired (Suno music with a loop-tail workaround, generated SFX), Nightmare and Night Shift modes (D-065), pacing package (D-064), stick fix (spawn anywhere), first-run map fix, fonts, streak-word throttle (`VAHŞET`), telemetry persistence and export, arena evolution, enemy looks, weapon tiers (all code-drawn), the 419 ChatGPT prompts, the importer, and the raster runtime.

**Pending owner decisions** (each has a 2026-11-14 line in `reviews/QUESTIONS.md`): accept **D-066** (raster art route, proposed); **D-067** (platform gate, after Phase 0 data); ratify **D-051** (two native scripts, still proposed); confirm music plays on the iPhone (iOS silent-switch fix is unverified on a device); review `reviews/TR-REVIEW-R1-T4.md`; approve the uiTap sound (`prototype/audio/sfx-gen/uiTap.mp3` passes `prepare-sfx.js --dry-run` but is not written to `ready/`, so the game still plays the synthesized cue); approve GitHub Actions CI; `gh auth login`; his iPhone model.

**Next: Phase 0 runbook.** `reviews/EXPERT-REVIEW-2026-11-14.md` section 6 has the done-when for each task. These are the first commands:
- **0.1 Merge to `main`** (after the owner's OK; the comics patch is already merged): `git fetch origin`; `git log --oneline origin/main..HEAD | wc -l` (about 80 at the handoff); `prototype/tools/run-tests.sh > /tmp/suite-0.1.log 2>&1 &` (about 20 minutes). The PR head is `r1/t2-art-direction` itself (no new branch). The PR text must say that D-051, D-066 and D-067 are still proposed: merging does not accept them. This PR also supersedes the old R1-T0 item "open the PR for `dialogue/two-native-scripts`" (that branch is contained in HEAD).
- **0.2 Device capture (`?bench=1`, not built yet):** `grep -n "params.get" prototype/js/main.js` (URL flags, lines 8 to 37); `sed -n 1,40p prototype/js/view/telemetry.js` (the export). Serve with `cd prototype && python3 tools/serve.py`; the phone URL needs `ipconfig getifaddr en0`.
- **0.3 Atlas downscale in the importer:** `node prototype/tools/prepare-art.js --dry-run` (also `--list`, `--only=`, `--force`); then `prototype/tools/run-tests.sh prepare-art art-raster`.
- **0.4 Fast tier, shared loader, CI (ask first):** `cat prototype/tools/run-tests.sh`; `sed -n 1,20p prototype/tools/lib-load.js` (the hand-kept file list is on line 6); `grep -c "<script" prototype/index.html` (254).
- **0.5 Split the files over 600 lines, fix the `objectives-hud` crash, verify iOS audio:** `wc -l prototype/js/view/sfx-bank2.js prototype/js/view/istanbul-props2.js prototype/js/view/sfx-bank.js`; `grep -n "R.toScreen" prototype/js/view/render.js` (the crash is at line 18); audio is checked on the phone with the silent switch on and off.
- **Gate A (D-067):** the owner picks the wrapper or the Godot port from the 0.2 data.

**Known issues, not fixed:** colourblind palettes do not exist in the view; the Istiklal badge sits under the tab row; HUD HP float; objective chips overlap the results title; map tab row overflows at 150% text; bot medians for Nightmare and Night Shift swing with the sample and Normal pacing is about 4.1 min a level against a 5 to 5.5 target (owner's real run: 4.3 min, 1902 kills); arena frame cost +1% to +9% p95 in a loaded run, not measured on a device.

## 6. The art pipeline (ChatGPT is the artist, you are the importer)

1. `art/commission/chatgpt/` holds the workflow: `README.md` (how the owner runs it), `PROJECT-INSTRUCTIONS.md`, `STYLE-BIBLE.md`, `prompts/<batch>/*.md` (**419** prompts, one per asset, generated from the game's own config by `prototype/tools/gen-art-prompts-characters.js` and `gen-art-prompts-world.js`; re-run them, never hand-edit a generated prompt), `prompts/ORDER-characters.md` and `prompts/ORDER-world.md`, and `art/commission/TRACKER.csv` (status per prompt: 419 rows; all `generated` at the handoff; set `approved` or `rejected` as the owner judges them in game).
2. The owner saves ChatGPT's PNGs to `art/commission/in/<batch>/<name>.png` (**git-ignored, 211 MB, 528 PNG files for 419 prompts, including re-dos such as `-v2`; only on this Mac**). The art-side spec you must follow is `art/commission/IMPLEMENTATION-HANDOFF.md` plus `asset-inventory.json` (copied from `/Users/o0o02dn/Documents/ChatGPT/istanbul art/asset-handoff/`, which also holds the originals and contact sheets).
3. `node prototype/tools/prepare-art.js` (see `art/commission/IMPORTER.md`) keys out the magenta or cyan background, splits sheets, packs atlases into `prototype/assets/art/` and writes `manifest.json` (schema 1, committed; 212 files, 27.6 MiB of a 60 MiB budget). Intermediates go to `art/commission/ready/` (git-ignored).
4. Runtime, all behind `?art=raster` with the code art as the fallback: `js/view/art-raster.js` (loader), `art-raster-chars.js`, `art-raster-world.js` (ground and facades), `art-raster-items.js` (props, vehicles, gems, icons). Tests: `test-art-raster`, `-world`, `-items`, `test-prepare-art`, `test-art-prompts`. Style: "Ink & Tea", #14151F outline, flat cel shading, warm light from the upper left, camera about 55 degrees, figures face right and the game mirrors them.
5. **Regenerate list** (asks for ChatGPT, details in `reviews/REVIEW-R1.md` part 20): boss_vatman and boss_bigbro at 512; boss attack and hurt frames (66 to 84% of idle height, bosses shrink); gnd_halic_steps and the feature tiles (seams); body-only weapon tiers (baked trails swamp the silhouette at 40 px); the tram (2.7:1 against the prompted 4.3:1); Istiklal bin, bollard and barrier props; grip anchors for held weapons; off-centre vehicle pivots. Missing prompts: hack terminals, buses, fauna.
6. **Batch gate status.** `art/commission/BRIEF.md` and the ChatGPT README planned batch 1 (first 10 levels) first, then a phone check. The owner generated all 419 prompts at once instead; the importer built every usable source (212 output files: sheets pack many prompts into one atlas). The phone check of `?art=raster` is still owed (Phase 0.2 and 1.1). Do not ask him to regenerate more until he has judged it.
7. **Seams the importer flags** (`node prototype/tools/prepare-art.js --dry-run`): gnd_karakoy_wateredge (worst), gnd_istiklal_a, _b, _d, gnd_halic_a to _d, gnd_halic_steps. The runtime hides most of it with mirror-repeat super-tiles; regenerate Istiklal first (Phase 1.1 hood).
8. **Provenance gap.** `art/PROVENANCE.csv` covers about 114 of the 528 source PNGs and has no rows for the Suno music or the AI SFX (its music row still says render-music.js). Fill it from `TRACKER.csv` (tool, model, date, prompt file) and ask the owner for his ChatGPT and Suno plan tiers before any public build (D-029, D-063).
9. Hand-wired Galata, Bridge and Saray props are older SVG atlases (`handwired: true` in the manifest) and are not emitted by the importer.

## 7. Audio pipeline

`prepare-music.js` and `prepare-sfx.js` turn the owner's drops into the tracked game files (`prototype/audio/music/*.mp3`, `sfx/`). Sources are **git-ignored and only on this Mac**: `prototype/audio/music-suno/` (Suno exports), `prototype/audio/sfx-gen/` (generated SFX). The Suno loops lack the 1.5 s crossfade tail, so `prepare-music.js` time-stretches up to 2% (or pads a stinger up to 0.5 s). iOS: `HTMLAudioElement.volume` is ignored, so music runs through Web Audio gain nodes; the silent switch mutes Web Audio, handled with `navigator.audioSession.type='playback'` plus a silent looping element, started from a gesture (`view/sfx.js`, `view/music.js`). `prepare-music.js` writes `prototype/audio/music-procedural/`, a backup of the old procedural tracks. It is git-ignored (root `.gitignore`); the old procedural tracks are also in git history.

## 8. What exists only on this Mac (not in git)

| What | Where | Size | If lost |
|---|---|---|---|
| ChatGPT source PNGs | `art/commission/in/` and `/Users/o0o02dn/Documents/ChatGPT/istanbul art/` | 211 MB and 104 MB | The committed atlases still run the game, but new imports and re-cuts need the sources |
| Suno originals, SFX WAVs | `prototype/audio/music-suno/`, `prototype/audio/sfx-gen/` | 38 MB, 3 MB | Committed mp3s still play; re-prep needs the originals |
| Dialogue review sheets (owner edits, may contain names; git-ignored on purpose) | `reviews/dialogue/*.csv`, `reviews/dialogue/work/` | 0.7 MB | The approved lines are already in `prototype/js/dialogue/`; the sheets show his edit history. Re-export with `prototype/tools/dialogue-export.js` |
| Full history of the previous agent's work | `/Users/o0o02dn/.claude/projects/-Users-o0o02dn-Documents-istanbul/*.jsonl` | | Grep it for the reasoning behind any decision |
| Owner's telemetry pastes | `/Users/o0o02dn/.wibey/temp/pastes/` | | One run is summarised in REVIEW-R1 part 19 |

**Owner action: back up the first three rows to cloud or an external disk.** They are the only copies; git does not hold them. A local snapshot was made at the handoff
(`/Users/o0o02dn/Documents/istanbul-local-sources-2026-11-14.tar`, same disk, so it protects against deletion, not disk loss). `art/commission/LOCAL-SOURCES.sha256`
(committed) lists every local-only source file with its checksum: check what is present with
`cd /Users/o0o02dn/Documents/istanbul && shasum -a 256 -c art/commission/LOCAL-SOURCES.sha256 --quiet`.

## 9. Handoff check (do this first; if you cannot answer from the repo, the handoff is lossy: tell the owner what is missing)

1. Which build is active, which branch, and may you merge it? (2026-11-14: the JS prototype; `r1/t2-art-direction`; no merge without the owner's OK; the PR targets `origin/main`.) 2. What does `?art=raster` change and what happens when an atlas is missing? 3. How do you run only the art tests, and which tests flake? 4. Where do player-visible strings go, and why must a voice line never be translated? 5. What makes a change "view only"? 6. Where do the raw ChatGPT images live and are they in git? 7. What does the owner mean by "whatever you recommend", and what must you still do? 8. What is D-066 and who must accept it? 9. Name three items on the regenerate list. 10. Which decisions are waiting on the owner? (2026-11-14: section 5 and the 2026-11-14 lines of `reviews/QUESTIONS.md`.)

Then: run `prototype/tools/run-tests.sh art-raster art-raster-world art-raster-items fonts quality`, start `serve.py`, open `?art=raster&fps=1` in a browser, and read `reviews/REVIEW-R1.md` from "R1-T4 part 19" to the end.

## 10. Working with the owner from Codex

- **Channel.** The owner talks to you in the Codex app chat on this Mac.
- **Phone.** He plays on his iPhone over the LAN. Start the server with `cd prototype && python3 tools/serve.py` (port 8765; it listens on 0.0.0.0). Find the Mac's LAN address with `ipconfig getifaddr en0` (192.168.4.21 on 2026-11-14). The phone URL is `http://<mac LAN ip>:8765/?fps=1&debug=1`. No tunnels (ngrok, cloudflared, Tailscale or similar): ask first.
- **Telemetry.** He pastes telemetry JSONL into the chat. Save each paste to `reviews/telemetry/<YYYY-MM-DD>-<what>.jsonl` (the folder does not exist yet: create it), then read it. Each event carries `install_id`, `session_id` and `device_model` (the user agent). The folder is not git-ignored, so do not `git add` these files until those fields are removed or the owner agrees. Older pastes are in `/Users/o0o02dn/.wibey/temp/pastes/`.
- **GitHub.** `gh` is not logged in to github.com (checked 2026-11-14; the Walmart host's token is invalid). Before you open a PR, ask him to run `gh auth login`.
- **iPhone model.** Not recorded yet. `reviews/QUESTIONS.md` asks for it (2026-11-14). Write the answer here when it comes.
- **Commit trailer.** Most earlier commits carry `Co-Authored-By: Wibey Desktop <wibey@walmart.com>` (almost all since 2026-11-08). Use your own tool's convention, or none. Never say you are Wibey.
- **Owner intent.** Use `reviews/OWNER-LEDGER.md` and `reviews/owner-messages-archive.md` (see section 4). If a doc disagrees with them, ask him.

## 11. The owner's first message to Codex (kept here so it is not lost)

```text
You are taking over implementation of Project Istanbul in this folder from a previous agent. Everything you need is in the repo.
1. Read, in order: AGENTS.md, docs/handoff-codex.md, reviews/EXPERT-REVIEW-2026-11-14.md, reviews/QUESTIONS.md (the 2026-11-14 lines), and skim reviews/OWNER-LEDGER.md.
2. Answer the 10 handoff-check questions at the end of docs/handoff-codex.md, each with a file citation. Mark any answer you had to guess.
3. Verify the state yourself: git status and branch, `shasum -a 256 -c art/commission/LOCAL-SOURCES.sha256 --quiet` (from the repo root), and run `prototype/tools/run-tests.sh art-raster art-raster-world art-raster-items fonts quality dialogue`.
4. Report in one screen: your answers, what you verified, anything in the handoff that is wrong, missing, contradictory or unclear, and your plan for Phase 0 task 0.1. Do not merge, push, or add any dependency or service until I approve.
```

A dry run of this message by a fresh agent on 2026-11-14 answered all ten questions correctly from the repo, the checksum check passed, and the six test files passed. Its remaining findings were fixed in the same commit as this section.
