# Accessibility checklist, R1 (canvas effects)

Updated 2026-11-12. Scope: every canvas effect in `prototype/js/view/` (71 files), including the R1 layers (weapons, held-weapon animation, comic panels, istanbul props and lamps, arena overhead, tram, blackout glitch). The UI files owned by the UI pass (screens, ui*, objectives-hud, css/*) are out of scope and are listed under "Not in this pass".

## Rules applied

- **Flash limit:** no more than 3 flashes a second anywhere (design-system §11, WCAG 2.3.1). A flash is an opposing pair of luminance changes. A signal that changes 3 times a second therefore flashes at most 1.5 times a second, which is why quantised sine terms count as compliant.
- **Area (team heuristic, not a WCAG number):** an element under about 150 by 150 px on a phone is treated as small and is not rate-capped. WCAG's own test is relative to a 10 degree field of view. The owner must confirm this heuristic (decision a below).
- **Reduce motion (DS §7):** disables shake, hit-stop, slow-mo and camera punch, and keeps flashes at 3/s or fewer.
- **Reduce flashing (`P.Settings.reduceFlash`):** removes white and red flashes, flicker and re-rolls, and holds a steady fallback.
- **Status:** `pass` = compliant with no change in this pass; `fixed` = changed in this pass; `needs-device` = cannot be decided from code; `owner` = needs a product decision.

## Screen-wide flash budget

`P.Sprites.flashOk` (sprites.js) allows at most 3 flash starts in any rolling 1 s window. The hero hit, hero edge pulse, enemy and prop flashes, blast and burst discs, and the low-HP heartbeat all draw from this one budget. Under Reduce flashing the budget returns false and no flash starts. A crowd of hits therefore cannot stack flashes; beyond 3 a second, the hit gets the squash and damage number only.

## Effect table

Hz is the rate of luminance or size change, or of flash starts. Area is the approximate on-screen size.

| Effect | Where | Hz | Area | Setting guard | Status |
|---|---|---|---|---|---|
| Hero hit flash | fx.js `heroHit` | at most 3 starts/s (shared budget) | hero sprite, small | Reduce flashing: no flash | fixed (budget) |
| Hero edge pulse on big hits | fx.js `heroHit` | at most 3/s (shared budget) | screen edge band, large | Reduce flashing: no pulse | fixed (budget) |
| Enemy hit flash | sprites.js `enemyFlashOk` | at most 3/s (budget) and `enemyFlashGap` | enemy sprite, small | Reduce flashing: no flash | fixed (budget) |
| Prop hit flash | sprites.js `propFlashOk` | at most 3/s (budget) | prop sprite, small | Reduce flashing: no flash | fixed (budget) |
| Blast disc | fx.js blast | at most 3/s (budget), 0.12 s | blast radius, can be large | via budget | fixed |
| Burst disc (weapons) | weapons-fx2.js | at most 3/s (budget), 0.18 to 0.3 s | up to 2.4 times the radius | via budget | fixed |
| Crowd hits | sprites.js, fx.js | squash only beyond 3/s | per hit | via budget | fixed (see owner b) |
| Low-HP heartbeat | fx.js `F.heart`, render.js `countHeartbeat` | 1.2 peaks/s (72 bpm), one smooth peak per beat | full-screen vignette | Reduce flashing: beat not counted as a flash | fixed (was more than 3 peaks/s) |
| Hero invulnerability blink | hero sprite | 1.5 Hz | small | Reduce flashing: off | pass |
| Neon lamp flicker | istanbul-props2.js:129 | 3 steps/s, quantised (max 1.5 flashes/s) | small sign | Reduce flashing: steady on | fixed |
| Neon blue toggle | istanbul-props2.js:180 | 1 Hz | small sign | Reduce flashing: off | pass |
| Window flicker | istanbul.js:312 | 3 steps/s, quantised, a few windows | one window | Reduce flashing: off | fixed |
| Parked-car alarm lamp | istanbul-props.js:58 | 2.5 Hz | small | Reduce flashing: steady on | pass |
| Burning-car fuse marker | events-fx.js:84 | 2 to 3 Hz (capped at 3) | small | Reduce flashing: steady fill | fixed (cap) |
| Blackout glitch tear | events-fx.js:175 | bands updated 3/s during a 0.4 s burst (was 14/s) | full screen | Reduce flashing: picture holds still; Reduce motion: steady soft dim | fixed |
| Blackout lamp dip | events-fx.js:162 | once per 1.7 s period (0.6/s) | lamp pools, full-screen dim | Reduce motion: no dip | pass |
| Overhang fade | arena-overhead.js | flips at most once per 0.34 s (about 1.5/s) | overhead rig, medium | Reduce motion or Reduce flashing: calm | fixed (was faster) |
| Arena glow twinkle | arena-overhead.js | 0.48 Hz | small | calm under either setting | pass |
| Tram lamps (breathe) | vehicles.js:52-53 | 0.48 Hz | small | none needed | pass |
| Pantograph contact glow | vehicles.js:50 | steady 0.8 while rushing; on/off at a threshold otherwise (a few times a minute) | small | Reduce motion: off | pass |
| Tram rush sway | vehicles.js:45, 86 | 6 Hz and 9.5 Hz, position only, 1.2 to 1.6 px | small | Reduce motion: zero | pass (motion, not luminance) |
| Weapon ring pulse | weapons-fx.js:281 | 3 steps/s, quantised | ring, small | Reduce flashing: steady 0.5 | fixed |
| Bolts (weapons-fx3) | weapons-fx3.js:156 | frame 3/s (was 30/s) | bolt, small | Reduce flashing: frame 0 | fixed |
| Bolts (weapons-fx4) | weapons-fx4.js:498 | frame 3/s (was 12/s) | bolt, small | Reduce flashing: frame 0 | fixed |
| Flame jet breathing | weapons-fx4.js:403 | 3 steps/s, about 5% size | small | Reduce flashing: steady | fixed |
| Flask flame | weapons-fx2.js | 3 steps/s, quantised | small | quantised | fixed |
| Held-weapon flicker (fl, lstar) | fire-anim-held.js | 3 steps/s, quantised | small | quantised | fixed |
| Torch flick | fire-anim-held2.js | 3 steps/s, quantised | small | quantised | fixed |
| Stormshield step | fire-anim-held3.js | 3/s (was 10/s) | shield, small | quantised | fixed |
| Stormshield pulse | fire-anim-held3.js | 3 steps/s, quantised | small | quantised | fixed |
| Grinder L flicker | fire-anim-held4.js | 3 steps/s, quantised | small | quantised | fixed |
| Grinder vibration | fire-anim-held4.js:83 | short burst at 0.3 to 0.5 s | small | Reduce motion: off | fixed |
| Star size (impacts) | fire-anim-fx.js | 3 steps/s, quantised | small | quantised | fixed |
| Comic static | comic.js:357 | 3/s (was 20/s) | panel, medium | Reduce flashing: frozen seed | fixed |
| Comic bars flick | comic.js:289 | 1 Hz | small | Reduce motion: off | pass |
| Comic ring wobble | comic.js:354 | 2.9 Hz, 2 px position | small | Reduce motion: off | pass (position) |
| Comic zoom | comic.js:121, 194 | motion | panel | Reduce motion: no zoom | pass |
| Pickup ring | config-feel.js `pickup` | about 11/s (one per 0.09 s) | 26 px or less | none; not rate-capped | owner (decision a, c) |
| Muzzle and impact sparks | weapons-fx*.js | per hit, not rate-capped | small | none | owner (decision c) |
| Screen shake (trauma) | fx.js:96-101 | motion | whole view | Reduce motion: zero; shake setting 0/50/100 scales it | pass |
| Camera kick | fx.js:101, feel.js:58-69 | motion | whole view | Reduce motion: zeroed in `F.kick` and `F.decayKick`; shake setting scales it | fixed |
| Hit-stop and slow-mo | feel.js:52-57, main.js:132, 355 | motion | whole view | Reduce motion: off | pass |
| Ambient weather drift | istanbul-landmarks.js | motion | whole view | Reduce motion: frozen (t = 0) | fixed |
| Bins and crates sway | enemies-fx2.js:116, 129 | motion | small | Reduce motion: calm | fixed |
| Boss spin | enemies-fx2.js:146 | motion | small | Reduce motion: 0.8 Hz wobble instead of spin | pass |
| Cold-open diner flash | enemy path | single event | small | budget | pass |
| Chest reveal shake | screens.js (UI pass) | about 9.5 Hz, position | UI | Reduce motion guard at function start | needs-device (UI pass) |

## Static test

`prototype/tools/test-a11y-canvas.js` scans the 71 view files for flicker candidates (rate above 3 Hz, on/off thresholds, re-rolls above 3/s, parity toggles, flash starts without the budget). A candidate passes if a Reduce token appears within 2 lines, or if the line is quantised. Result: 14 candidates, 4 allowlisted, 19 wiring checks, all pass.

`prototype/tools/a11y-canvas-allowlist.json` holds the 4 geometry-only exemptions. Each has a rationale of at least 40 characters, and a stale entry fails the test:

- `fire-anim-held2.js` extinguisher recoil wobble (6.4 Hz, rotation only).
- `fire-anim-held2.js` manhole strain-mark length jitter (4.8 Hz, about 2 cm, position only).
- `fire-anim-held3.js` foam-storm recoil wobble (6.4 Hz, rotation only).
- `fire-anim-held3.js` arc-chain link position wobble (3.2 Hz, 1 to 2 px, position only).

## Phone checklist (manual, on device)

Reduce motion ON (Settings):
- [ ] No shake on hits, heavy blows or the ult; no camera kick; no hit-stop or slow-mo at level-up or death.
- [ ] Weather drift is frozen; bins and crates do not sway; comic panels do not zoom.
- [ ] Tram rush: car and speed streaks show; no sway, sparks or dust.
- [ ] Toasts and meta panels change by fade only; the call card appears and leaves at once; no death zoom.

Reduce motion OFF:
- [ ] Shake at 50% is half the strength of 100%; 0% gives none.
- [ ] Death: the world desaturates and eases in about 5% on the hero for 0.4 s inside the 0.8 s freeze (no time change). Comic pages slide, at most two a second. Toasts and meta panels fade out.

Reduce flashing ON:
- [ ] No full-screen white or red flash; no neon or alarm flicker; the fuse marker holds steady; the blackout picture holds still with a soft dim.
- [ ] Hits still read through squash and damage numbers.
- [ ] The low-HP heartbeat still pulses softly (1.2 a second) with no extra flash.

Reduce flashing OFF:
- [ ] Record a 60 fps capture of a crowd fight and of a blackout; screen-wide luminance peaks are 3 a second or fewer.

Colour-blind check (shape, not colour):
- [ ] Enemy attack telegraphs, hazards (fire, poison, electric) and pickups are identifiable in greyscale.
- [ ] Pickup colours (XP, jeton, simit, chest) have a shape or label cue. Not checked in this pass.

Text size:
- [x] Built: Settings > Text size offers 100, 125 and 150%, and the UI font sizes scale with it (REVIEW-R1, T4 part 2). Checked in the headless browser at 150%; the fixes are listed there.
- [ ] On a phone at 150%: no clipping on the HUD, the menus, the card text or the call card's subtitle. The comic bubbles and pops are canvas and do not scale (owner decision e).

Tap target:
- [x] Built: the buttons that were under 48 dp are now 48 px (the cold-open skip, mod options, hub tabs, meta tabs, meta icon and stat buttons, reroll buttons, toggles). `tools/test-ui-motion.js` checks them in CSS. The brief said 44 pt; DS §5 and §11 say 48 dp, which is the stricter bound and the one used here.
- [ ] On a phone: measure every button (48 dp is about 132 px at the 1080 px reference) and check the 16 px gap between targets. No test checks the gap.

## Owner decisions

- **(a) Area heuristic.** Is "under about 150 by 150 px on a phone is small" the right exemption? If not, the pickup ring and spark rows need a rate cap. One option, not applied: keep the pickup ring steady under Reduce flashing (a one-line change).
- **(b) DS §7 vs §11.** DS §7 says every hit flashes white for 60 ms. At more than 3 hits a second that conflicts with §11. The budget now gives squash only beyond 3 a second. Amend §7, or accept the budget as the rule.
- **(c) Pickup ring and sparks.** The pickup ring (about 11/s) and muzzle and impact sparks are left at full rate because each is small. Confirm.
- **(d) Tap target.** Confirm 48 dp (DS) over 44 pt (brief).
- **(e) Text size.** Built in REVIEW-R1 T4 part 2 (100, 125 and 150%). Confirm that canvas lettering and comic pops staying at their size is the intended scope, and that the TR label "Yazı boyutu" is right (marked `// TR owner check`).
- **(f) Chest reveal shake.** `screens.js` shakes about 9.5 times a second on the chest reveal. It is guarded by Reduce motion at the start of the function, and it belongs to the UI pass. Flagged for that owner.

## Not in this pass

- The UI files (screens.js, ui*, objectives-hud.js, ui-motion.js, css/*, motion.css) are not audited here. Their motion, text size and tap targets are covered by REVIEW-R1 T4 part 2; the chest reveal note above still stands.
- Subtitles, haptics and the screen-reader pass (DS §11) are outside the canvas scope.
- Device checks above are required before any "pass" in this table is treated as verified on a phone.
