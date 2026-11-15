// Interaction clarity tokens (T4 part 10): first-time hints, the consumable grammar and the hack-zone ("link - hold") look.
// View only: the simulation never reads these numbers (architecture 4.17). Times in s; sizes in px of the 390 x 844 phone
// unless the name says m (metres). Colours here are the same ones the game uses elsewhere (design-system 3.2).
(function (C) {
  C.hints = {
    showS: 2,                       // a callout stays up this long (s); it never pauses the game
    gapS: 4,                        // least gap between two callout starts (s)
    fadeS: 0.1,                     // fade in and out (s); opacity only, the length of the --m-rm token
    bobHz: 0.5,                     // arrow bob with motion on (Hz); no loop in this file runs faster than this
    bobPx: 4,                       // bob amplitude (px)
    marginPx: 24,                   // callouts and edge arrows keep this far from the phone edge
    hudBottomPx: 170,               // the HUD block ends above this line; callouts stay below it unless they point at the HUD
    heroBoxPx: { w: 64, h: 84 },    // keep-out box around the hero's screen point; a callout never covers it
    gapPx: 14,                      // space between a callout and its anchor
    arrowPx: 10,                    // arrow length
    iconPx: 16,                     // tiny icon in the callout
    dashEnemies: 3,                 // dash hint: this many enemies within dashNearM of the hero while dash is ready
    dashNearM: 2.5,
    storeKey: 'nsi.hints.v1',       // the seen list; a hint shows once ever (per store)
    callAnchor: 'call',             // HUD element ids the HUD hints point at
    dashAnchor: 'dash-chip'
  };
  // Kind of each hint: the icon name (consumables-icons.js) and the colour of the callout's icon.
  C.hintKinds = {
    heal:      { icon: 'cross',   fill: '#2EBD6B' },
    eczane:    { icon: 'cross',   fill: '#2EBD6B' },
    kiosk:     { icon: 'bufe',    fill: '#2EBD6B' },       // R1-T4 part 17: the simit and tea büfe heal station
    currency:  { icon: 'coin',    fill: '#E9A23B' },
    objective: { icon: 'pin',     fill: '#3D8BFF' },
    chest:     { icon: 'star',    fill: '#FFD166' },
    explosive: { icon: 'flame',   fill: '#FF4D2E' },
    cover:     { icon: 'crate',   fill: '#C98A4B' },
    link:      { icon: 'link',    fill: '#7CC7FF' },
    tram:      { icon: 'tram',    fill: '#FF4D2E' },
    door:      { icon: 'door',    fill: '#E9A23B' },
    dash:      { icon: 'chevron', fill: '#7CC7FF' },
    call:      { icon: 'phone',   fill: '#FFD166' }
  };
  // A hint that would repeat a scripted L1 prompt waits until that prompt's step is done (director.js step ids). The canister
  // prompt (t_env) exists only in the L1 script, so the gate is scoped to level 1. The link hint waits on the generic rule:
  // no hint starts while a scripted prompt (t_hack, the first terminal's "Link · hold") is on screen.
  C.hintGates = { explosive: { step: 't_env', level: 1 } };

  C.consumables = {
    minRPx: 14,                     // least ring radius on screen (28 px across): visible from afar
    glowM: 0.6,                     // glow and ring radius (m) before the minimum applies
    iconM: 0.24,                    // icon radius (m) before the minimum applies
    iconMinPx: 9,                   // least icon radius (px)
    bobM: 0.05,                     // bob amplitude (m); off under Reduce motion
    bobHz: 0.5,                     // bob rate (Hz)
    pulseHz: 0.8,                   // glow pulse rate on usable things (Hz); steady under Reduce motion or Reduce flashing
    stationPulseHz: 0.5,            // the usable glow of a heal station (eczane and kiosk sign), Hz; 0.5 or less (R1-T4 part 17)
    pulseAmp: 0.18,                 // glow alpha swing (around 1)
    burstT: 0.35,                   // use burst ring life (s)
    burstR0M: 0.3,                  // use burst ring: start and end radius (m)
    burstR1M: 1.1,
    floatT: 0.7,                    // floating text life (s)
    floatRisePx: 26,                // float rise (px); none under Reduce motion
    floatPx: 16,                    // floating text size (px); the damage numbers use 14 px and 24 px for crits
    trailM: 0.4                     // magnet streak behind a pickup that is flying to the hero (m)
  };

  // Hack zone ("Link · hold"): the ring that fills while the hero stands in it. Radius comes from P.CFG.hack.r.
  C.hackZone = {
    rimFrac: 0.86,                  // the progress rim sits at this fraction of the zone radius
    rimPx: 7,                       // rim width (px)
    iconFrac: 0.34,                 // icon radius as a fraction of the zone radius
    iconMinPx: 14,                  // least icon radius (px)
    pulseHz: 0.8,                   // ground glow pulse while linking (Hz); steady under Reduce motion or Reduce flashing
    pulseAmp: 0.12,
    popT: 0.4,                      // completion pop (s): the ring grows and fades
    popScale: 1.25,
    edgeArrowPx: 22,                // arrow at the screen edge for a terminal off screen
    edgeInsetPx: 36                 // the edge arrow sits this far inside the phone
  };
})(P.CFG);
