# Wave 3 brief (v0.8): AUDIT-7 fixes

Source: `reviews/AUDIT-7-2026-11-08.md` and `reviews/media/AUDIT-7/`:
- `code-review-v07.md`
- `cr-scripts/`: repro scripts
- `capture-v07.py`
- screenshots

The audit comes from an independent AI auditor. VERIFY each claim before fixing it:
- run the repro or read the code
- if a claim is wrong, say so in your report with evidence, and don't "fix" it

Rules:
- Everything in `reviews/WAVE2-BRIEF.md` still applies:
  - repo layout and AGENTS.md rules
  - guardrails
  - shared-file etiquette (tiny guarded edits; re-read before editing)
  - native TR/EN bark pools
  - P.Speech for bubbles
  - shared browser, shell tips
  - no commits
- Baseline is HEAD cda14b3. Five lanes work in parallel (T0 bugs, H horde/enemies, L levels/places, U UI density,
  R restaurant art/finale). Edit only the files your prompt gives you.

Verify before finishing:
- `node tools/test-arsenal.js --quick`: PASS
- `node tools/test-env.js`: pass
- `node tools/bot.js --seeds=30`: L1 ≥28/30
- `node tools/bot.js --levels=2,4,5,7,12,22,25,50,63,75,100 --seeds=6`: no crashes or timeouts

Report back in ≤200 words: each claim marked verified or refuted, the fix, files, tests, screenshot verdict.
