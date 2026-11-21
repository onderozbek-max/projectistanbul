// Arda's full-body attack poses. Time is relative to the held action. Each beat sets the
// lean along the aim, sideways twist, stance height and painted wrist pose.
P.HeroAttacks = (function () {
  var A = {}, rest = [1, 0, 0, 0, 'rest'];
  var styles = {
    // Slice past the target, unwind through the opposite hip.
    knife: { priority: 2, hold: 0.09, gain: 0.66, beats: [
      [0, 0.16, -0.15, -0.06, 'reach'], [0.22, 0.31, 0.19, -0.11, 'reach'], [0.67, 0.09, 0.06, -0.02, 'brace']] },
    // Short backward kick and a low, planted reset.
    nailgun: { priority: 1, hold: 0.06, gain: 0.54, beats: [
      [0, -0.23, 0, -0.09, 'reach'], [0.23, -0.12, 0.01, -0.08, 'reach'], [0.55, 0.02, 0, -0.03, 'brace']] },
    // The heavy load rises over the back foot before the forward throw.
    canister: { priority: 3, hold: 0.26, gain: 0.48, beats: [
      [0, -0.06, 0, -0.08, 'brace'], [0.38, -0.25, -0.09, 0.15, 'raise'], [0.62, 0.27, 0.08, -0.07, 'reach'], [0.80, 0.15, 0, -0.13, 'brace']] },
    // Turn through both sides on a low stance.
    chain: { priority: 3, hold: 0.11, gain: 0.60, beats: [
      [0, 0.02, -0.20, -0.05, 'pull'], [0.30, 0.13, 0.23, -0.11, 'reach'], [0.62, -0.05, -0.14, -0.07, 'brace']] },
    // Sampled against the slam event below so every actual blow gets its own drop.
    sledge: { priority: 4, hold: 0.12, gain: 0.60, beats: [
      [0, -0.01, 0, -0.04, 'brace'], [0.26, -0.25, -0.08, 0.18, 'raise'], [0.49, -0.19, -0.06, 0.12, 'raise'],
      [0.5, 0.35, 0.06, -0.25, 'reach'], [0.69, 0.20, 0.02, -0.18, 'brace']] },
    // Rear shoulder rises, then tips across the body into the throw.
    molotov: { priority: 2, hold: 0.24, gain: 0.58, beats: [
      [0, 0.02, -0.05, 0, 'brace'], [0.54, -0.13, -0.13, 0.12, 'raise'], [0.77, 0.20, 0.12, -0.08, 'reach']] },
    // Tuck below the launch, then pop upright from the knees.
    fireworks: { priority: 2, hold: 0.08, gain: 0.49, beats: [
      [0, -0.08, 0.04, -0.14, 'pull'], [0.24, -0.20, 0.08, 0.12, 'raise'], [0.59, -0.07, 0.02, 0.05, 'brace']] },
    // Discharge snaps the shoulder twice, with the far arm tucked in.
    cable: { priority: 1, hold: 0.08, gain: 0.53, beats: [
      [0, 0.12, 0.04, 0.03, 'reach'], [0.18, -0.15, 0.08, -0.08, 'pull'], [0.36, 0.07, -0.10, 0.02, 'reach'], [0.57, -0.05, 0.03, -0.03, 'brace']] },
    // Line up the rail, rock back on release, then straighten.
    speargun: { priority: 2, hold: 0.10, gain: 0.56, beats: [
      [0, 0.15, 0, -0.03, 'reach'], [0.21, -0.24, 0, -0.11, 'brace'], [0.54, -0.12, 0, -0.09, 'pull']] },
    // Pressure rocks the torso back and keeps the knees bent.
    extinguisher: { priority: 2, hold: 0.10, gain: 0.57, beats: [
      [0, -0.17, -0.03, -0.08, 'brace'], [0.28, -0.20, 0.06, -0.13, 'reach'], [0.68, -0.09, -0.04, -0.08, 'brace']] },
    // Flat sidearm release with a second brace when the real disc returns.
    sawblade: { priority: 2, hold: 0.18, gain: 0.63, beats: [
      [0, -0.05, -0.20, 0.01, 'pull'], [0.23, 0.14, 0.20, -0.09, 'reach'], [0.43, 0.08, 0.08, -0.04, 'brace'], [0.62, 0, 0, 0, 'rest']] },
    // Broad, two-handed discus turn with a deeper knee drop.
    manhole: { priority: 3, hold: 0.30, gain: 0.55, beats: [
      [0, -0.08, -0.12, -0.11, 'brace'], [0.42, -0.15, -0.22, -0.14, 'pull'], [0.61, 0.21, 0.19, -0.09, 'reach'], [0.84, 0.04, 0.09, -0.03, 'brace']] },
    // Shallow ignition dip followed by a sustained thrust.
    torch: { priority: 1, hold: 0.09, gain: 0.57, beats: [
      [0, -0.06, 0.03, -0.10, 'brace'], [0.27, 0.15, -0.04, -0.05, 'reach'], [0.70, 0.13, 0.04, -0.09, 'reach']] },
    // High cast with a low counterpull when the line takes load.
    olta: { priority: 3, hold: 0.28, gain: 0.64, beats: [
      [0, -0.05, -0.04, 0, 'brace'], [0.26, -0.19, -0.09, 0.12, 'raise'], [0.46, 0.16, 0.05, -0.03, 'reach'],
      [0.77, -0.19, 0.07, -0.14, 'pull']] },
    // Curl behind the door, plant, then shove from both shoulders.
    cardoor: { priority: 3, hold: 0.24, gain: 0.54, beats: [
      [0, -0.04, 0, -0.17, 'brace'], [0.34, -0.10, -0.06, -0.10, 'raise'], [0.58, 0.26, 0, -0.15, 'reach'], [0.82, 0.12, 0, -0.06, 'brace']] },
    // Pull the draw hand back, let it snap forward in a narrow stance.
    slingshot: { priority: 2, hold: 0.20, gain: 0.56, beats: [
      [0, -0.06, -0.08, 0.04, 'pull'], [0.37, -0.18, -0.13, 0.07, 'raise'], [0.56, 0.15, 0.03, -0.05, 'reach'], [0.72, -0.04, 0.01, 0, 'brace']] },
    // Sink into the rev, press through its changing aim, unload the stance.
    chainsaw: { priority: 4, hold: 0.13, gain: 0.52, beats: [
      [0, -0.13, 0, -0.15, 'brace'], [0.18, 0.26, -0.13, -0.19, 'reach'], [0.56, 0.24, 0.11, -0.19, 'reach'], [0.84, 0.04, 0.02, -0.10, 'brace']] }
  };
  var evolvedStyles = {
    cleaver: { priority: 4, hold: 0.22, gain: 0.54, beats: [
      [0, -0.10, -0.19, 0.15, 'raise'], [0.18, 0.22, 0.16, -0.17, 'reach'], [0.47, -0.06, -0.19, -0.07, 'pull'],
      [0.72, 0.16, 0.10, -0.12, 'reach']] },
    nailstorm: { priority: 2, hold: 0.13, gain: 0.46, beats: [
      [0, -0.19, -0.11, -0.15, 'brace'], [0.28, -0.15, 0.14, -0.13, 'reach'], [0.51, -0.09, 0.03, -0.17, 'brace']] },
    cluster: { priority: 3, hold: 0.24, gain: 0.50, beats: [
      [0, -0.11, 0.13, -0.10, 'pull'], [0.44, -0.22, -0.14, 0.07, 'raise'], [0.65, 0.18, 0.22, -0.12, 'reach'],
      [0.82, 0.02, 0.12, -0.16, 'brace']] },
    cyclone: { priority: 4, hold: 0.18, gain: 0.52, beats: [
      [0, 0.02, 0.20, 0.03, 'reach'], [0.24, 0.11, -0.23, -0.18, 'pull'], [0.51, -0.13, 0.19, -0.10, 'reach'],
      [0.72, -0.05, -0.14, 0.02, 'raise']] },
    blacksmith: { priority: 4, hold: 0.20, gain: 0.57, beats: [
      [0, -0.07, 0.06, -0.12, 'brace'], [0.26, -0.21, 0.10, 0.19, 'raise'], [0.49, -0.14, 0.05, 0.16, 'raise'],
      [0.5, 0.28, -0.05, -0.22, 'reach'], [0.66, 0.09, 0.06, -0.21, 'brace'], [0.82, -0.04, 0.01, 0.08, 'raise']] },
    stormshield: { priority: 3, hold: 0.17, gain: 0.50, beats: [
      [0, 0.10, -0.15, 0.08, 'raise'], [0.25, 0.15, 0.20, -0.04, 'reach'], [0.58, -0.06, 0.17, -0.15, 'brace'],
      [0.79, -0.09, -0.06, -0.08, 'pull']] },
    foamstorm: { priority: 3, hold: 0.20, gain: 0.50, beats: [
      [0, -0.16, -0.12, -0.17, 'brace'], [0.31, -0.20, 0.19, -0.20, 'reach'], [0.63, 0.06, 0.14, -0.10, 'reach']] },
    netspear: { priority: 3, hold: 0.20, gain: 0.51, beats: [
      [0, 0.04, 0.09, -0.14, 'brace'], [0.39, -0.18, -0.14, 0.03, 'pull'], [0.53, 0.26, 0.10, 0.09, 'raise'],
      [0.76, -0.14, -0.10, -0.17, 'brace']] },
    twinsaw: { priority: 3, hold: 0.20, gain: 0.54, beats: [
      [0, -0.10, 0.21, -0.05, 'raise'], [0.23, 0.20, -0.24, -0.10, 'reach'], [0.40, -0.10, 0.08, 0.06, 'pull'],
      [0.59, 0, 0, 0, 'rest']] },
    fireball: { priority: 3, hold: 0.24, gain: 0.52, beats: [
      [0, -0.05, 0.13, -0.11, 'brace'], [0.42, -0.18, 0.11, 0.16, 'raise'], [0.64, 0.25, -0.06, -0.05, 'reach'],
      [0.83, 0.18, -0.10, -0.15, 'brace']] },
    forge: { priority: 3, hold: 0.18, gain: 0.53, beats: [
      [0, -0.04, -0.16, -0.09, 'pull'], [0.30, 0.20, 0.20, -0.20, 'reach'], [0.57, 0.16, -0.19, -0.19, 'reach'],
      [0.81, -0.12, 0, 0.03, 'raise']] },
    grinder: { priority: 4, hold: 0.16, gain: 0.52, beats: [
      [0, -0.11, 0.11, -0.16, 'brace'], [0.18, 0.22, -0.13, -0.22, 'reach'], [0.55, 0.26, 0.12, -0.18, 'reach'],
      [0.79, -0.10, -0.08, -0.15, 'pull']] },
    hookpull: { priority: 3, hold: 0.27, gain: 0.53, beats: [
      [0, -0.12, 0.08, 0.10, 'raise'], [0.26, 0.22, -0.08, 0.02, 'reach'], [0.57, -0.25, -0.13, -0.16, 'pull'],
      [0.80, -0.15, 0.13, -0.20, 'brace']] },
    minibus: { priority: 4, hold: 0.29, gain: 0.53, beats: [
      [0, -0.08, 0.06, -0.17, 'brace'], [0.29, -0.17, -0.13, -0.16, 'pull'], [0.50, 0.28, 0.08, -0.20, 'reach'],
      [0.73, 0.19, 0.10, -0.13, 'reach']] },
    // Catch the returning charge across the body after the first whip.
    arcchain: { priority: 3, hold: 0.16, gain: 0.56, beats: [
      [0, -0.05, -0.19, -0.11, 'pull'], [0.31, 0.19, 0.24, 0.03, 'reach'],
      [0.57, -0.19, -0.16, -0.14, 'brace'], [0.78, 0.08, 0.08, -0.04, 'pull']] },
    // Drop low under the weight, then pitch the bomb and duck the release.
    carbomb: { priority: 4, hold: 0.28, gain: 0.52, beats: [
      [0, -0.08, 0.14, -0.16, 'brace'], [0.40, -0.23, -0.08, 0.15, 'raise'],
      [0.61, 0.24, 0.12, -0.09, 'reach'], [0.79, -0.08, 0.05, -0.20, 'brace']] },
    // Tip the bottle into a low sweep, then turn away as the pool spreads.
    lake: { priority: 3, hold: 0.26, gain: 0.51, beats: [
      [0, -0.06, 0.04, 0.03, 'brace'], [0.45, -0.12, -0.18, 0.13, 'raise'],
      [0.68, 0.21, 0.23, -0.16, 'reach'], [0.84, -0.05, 0.15, -0.06, 'pull']] },
    // Plant the feet for the first launch and rise through the rest of the burst.
    finale: { priority: 3, hold: 0.18, gain: 0.52, beats: [
      [0, -0.05, 0.12, -0.18, 'brace'], [0.32, -0.21, -0.08, 0.10, 'raise'],
      [0.54, -0.08, 0.17, 0.17, 'reach'], [0.79, 0.07, -0.10, 0.04, 'brace']] }
  };
  var catchBeats = [[0, 0.13, -0.03, -0.06, 'reach'], [0.30, -0.22, 0.08, -0.15, 'pull'],
    [0.66, -0.10, 0.02, -0.07, 'brace']];
  // The upper ranks put a second weight shift into the recovery. [Start, end, along aim, across aim, height.]
  var follow = {
    knife:         [0.35, 0.82,  0.08, -0.19,  0.04], // hip unwinds after the cut
    nailgun:       [0.02, 0.51, -0.14,  0.02, -0.04], // slide kicks back to the shoulder
    canister:      [0.58, 0.96,  0.10,  0.04, -0.10], // lands on the forward leg
    chain:         [0.29, 0.88, -0.05, -0.19, -0.06], // shoulders check the returning links
    sledge:        [0.49, 0.92,  0.13,  0.03, -0.13], // both knees absorb the blow
    molotov:       [0.58, 0.97,  0.09,  0.15, -0.05], // reaches out across the bottle's flight
    fireworks:     [0.20, 0.78, -0.11,  0.09,  0.12], // springs upright from the launch
    cable:         [0.18, 0.61,  0.10, -0.13, -0.03], // hand snaps inward on the second beat
    speargun:      [0.18, 0.72, -0.15, -0.04, -0.07], // line checks the back foot
    extinguisher:  [0.26, 0.84, -0.12,  0.11, -0.08], // counter-leans into the spray
    sawblade:      [0.35, 0.86, -0.06, -0.16,  0.06], // rotates out of the disc's arc
    manhole:       [0.47, 0.97,  0.10,  0.16, -0.09], // rides the discus turn into a long step
    torch:         [0.28, 0.89,  0.11, -0.09, -0.06], // leans into the sustained jet
    olta:          [0.59, 0.99, -0.17,  0.05, -0.11], // drops back against the line
    cardoor:       [0.49, 0.91,  0.15,  0.10, -0.10], // drives through the shove
    slingshot:     [0.41, 0.80, -0.09, -0.12,  0.05], // releases the draw with a narrow kick
    chainsaw:      [0.43, 0.94,  0.12,  0.15, -0.10]  // follows the late cut through the hips
  };
  var catchFollow = [0.22, 0.84, -0.16, 0.12, -0.08];
  var followGain = [0, 0.22, 0.44, 0.74, 1];

  A.style = function (id) {
    var evo = P.CFG.evolutions && P.CFG.evolutions[id];
    return evolvedStyles[id] || styles[evo ? evo.from : id];
  };

  function phase(k, f) {
    if (k.id === 'sledge' || k.id === 'blacksmith') {
      if (f.impactAt !== undefined) return 0.5 + 0.5 * (k.t - f.impactAt) / Math.max(0.01, k.T - f.impactAt);
      return 0.49 * Math.min(1, k.t / (f.windup || P.CFG.weapons.sledge.windup));
    }
    return k.p;
  }

  A.sample = function (k, reduce, out) {
    var s = A.style(k.id);
    if (!s) return null;
    var catching = k.f && k.f.catchDisc, beats = catching ? catchBeats : s.beats;
    var q = Math.max(0, Math.min(1, phase(k, k.f || {}))), a = beats[0], b, i = 1;
    while (i < beats.length && q >= beats[i][0]) a = beats[i++];
    b = beats[i] || rest;
    var t = (q - a[0]) / (b[0] - a[0]);
    t = t * t * (3 - 2 * t);
    var evo = !styles[k.id], boost = 1 + s.gain * (evo ? 1.10 : (k.lv - 1) / 4);
    var weight = boost * (reduce ? 0.36 : 1), sa = Math.sin(k.ang), ca = Math.cos(k.ang);
    var along = a[1] + (b[1] - a[1]) * t, cross = a[2] + (b[2] - a[2]) * t, height = a[3] + (b[3] - a[3]) * t;
    var shift = catching ? catchFollow : follow[k.id];
    if (shift && q > shift[0] && q < shift[1]) {
      var recovery = Math.sin(Math.PI * (q - shift[0]) / (shift[1] - shift[0]));
      recovery *= recovery * (evo ? 1 : followGain[k.lv - 1]) * (reduce ? 0.22 : 1);
      along += shift[2] * recovery; cross += shift[3] * recovery; height += shift[4] * recovery;
    }
    out.lean = (along * ca - cross * sa) * weight;
    out.depth = (along * sa + cross * ca) * weight;
    out.height = height * weight;
    out.roll = out.lean * 0.47;
    out.arm = q > 0.94 ? 'rest' : a[4];
    out.aim = k.ang;
    P.HeroFootwork(k, q, reduce, out);
    return out;
  };
  return A;
})();
