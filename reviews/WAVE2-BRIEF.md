# Wave 2 brief (v0.7): implement AUDIT-6 lanes in parallel

Project: Project Istanbul browser prototype at `/Users/o0o02dn/Documents/istanbul/prototype`. Classic scripts share
global `P`; it runs over file://. The sim is pure and seeded (60 Hz) and emits `s.events`, which the view drains in
`js/main.js`. It uses an SoA swarm: there is no object per enemy. Render hooks go through `hook(obj, fn, s)` in
`js/view/render.js`.

Read first:
- `reviews/AUDIT-6-2026-11-08.md`: §3 lane ownership table, your lane's items, §6 guardrails
- `AGENTS.md` hard rules:
  - files ≤600 lines; one concern per file
  - no magic numbers in sim (use config files)
  - the sim never reads quality settings
  - localization keys, TR and EN
  - no flashes faster than 3 per second
- guardrails:
  - no real brands, flags, police, military or state actors
  - no religion or politics as targets
  - no mosques, churches or state monuments as targets or destructibles
  - no earthquake imagery (no collapsing buildings)
  - animals are never harmed
  - no body-shaming

What changed since AUDIT-6 (HEAD 90ebe66 includes it; don't regress any of it):
- **`P.Speech` (`js/view/speech.js`):** arbitrates every on-screen bubble. Any new bubble or callout goes through it.
- **`P.Indoor` (`js/view/indoor.js`):** indoor flags; no gulls or rain indoors.
- **Removed:** random camera punches, flashes, speed lines and near-miss slow-mo. Never add camera motion without a visible cause.
- **Added in fx.js:** finisher kill-cam, chain-reaction callout (ZİNCİR!), last stand (SON NEFES!), HUD streak/frenzy meter.
- **Barks:** native per-language pools `P.BarkPools[lang][poolKey]` (`js/story/strings-barks-tr.js`, `-en.js`). New bark pools need lines in BOTH files, written natively (not translated), mostly plain, jokes rare.
- **Comic busts:** `js/view/comic-busts*.js`.

Rules for parallel work (7 lanes: F, G, A, B, C, W, P):
- Edit only your lane's files (AUDIT-6 §3 table plus the new files named in your prompt). Put new strings in a NEW
  `js/strings-<lane>.js` file (TR and EN) unless your lane owns a strings file.
- Shared files (`js/sim/sim.js`, `js/sim/combat.js`, `js/main.js` for non-F lanes, `render.js` for non-G lanes, `index.html`):
  - only tiny, guarded (`if (P.X && P.X.fn)`) edits
  - re-read the file immediately before every edit
  - never reformat or move other code
- New scripts:
  - append a `<script>` tag in `index.html` next to related scripts (re-read first)
  - also add it to the loader lists in `tools/bot.js` and `tools/test-arsenal.js` if it's sim or config, or if the arsenal draw smoke loads view files
- Render hooks Lane G provides (implement the objects; if a hook is missing when you test, add the guarded call yourself next to existing hook calls):
  - `P.EnvFx.drawGround` / `drawProps` / `drawAir`
  - `P.EnemiesFx2.drawUnder` / `drawOver`
  - `P.LayoutFx.drawGround`
- Event names: new `s.events` types must be unique and lane-prefixed in spirit (env*, boss*, obj*, skill*). Unknown
  types must be harmless everywhere.

Verify before you finish:
- `node tools/bot.js --seeds=30`: L1 ≥28/30 clears
- `node tools/test-arsenal.js --quick`: PASS
- the bot levels your lane affects: no crashes or timeouts

Current reference (expected loadout): L25 6/6, L50 5/6, L75 6/6, L100 3/6. If a failure is clearly caused by another
lane's in-progress edit, note it instead of editing their files.

Browser:
- `mcp__wibey-browser__*` is SHARED by all lanes. Re-navigate before each check.
- URL: `file:///Users/o0o02dn/Documents/istanbul/prototype/index.html`. Shortcuts: `?level=N`, `?map=1`, `?arsenal=1`, `?seed=N`, `?seg=B`.
- Evaluate scripts must be IIFEs or Promises and finish in under 10 s. `P.debug` = {sim, state, playLevel, openMap}.
- Screenshot your work at phone size and judge it as a player.

Shell:
- avoid '~' and `python3 -` heredocs
- write temp scripts with the Write tool and delete them afterwards
- do NOT commit

Report back in ≤200 words: items done, verified or skipped; files; event names and hooks; test results; screenshot verdict.
