// The crowd comparison uses a fresh, seeded run and feeds movement into the real combat step.
P.WeaponLab = (function () {
  var L = {}, C = P.CFG.weaponLab;
  var base = P.CFG.arsenal.weapons, evos = Object.keys(P.CFG.evolutions);
  var streetChoices = { streetCart: 'cart', streetStall: 'lx_stall' };
  var weapon = 'knife', rank = 1, running = false, mixed = false, panel, pick, ranks, start, note, mix;
  var backups = ['knife', 'nailgun', 'sledge', 'chainsaw', 'cardoor', 'olta'];
  L.config = C;

  function spawn(s) {
    var slot = (s.nextId - 1) % C.crowd, row = Math.floor(slot / C.columns), col = slot % C.columns;
    var side = row < 2 ? -1 : 1, offset = C.lane + (row % 2) * C.rowGap;
    var type = C.types[(col + row) % C.types.length];
    var point = { x: (col - (C.columns - 1) / 2) * C.spacing, y: C.startY + side * offset };
    P.World.clampWalk(point, P.CFG.enemies[type].radius, s.props);
    var enemy = P.Combat.spawnEnemy(s, type, point.x, point.y);
    if (enemy) enemy.xp = 0;
    return enemy;
  }

  function companions(id) {
    var family = P.CFG.evolutions[id] ? P.CFG.evolutions[id].from : id;
    return backups.filter(function (w) { return w !== family; }).slice(0, 4);
  }

  L.setup = function (s, id, n, mixture) {
    var selection = {};
    var prop = streetChoices[id], street = !!prop;
    if (!street) selection[id] = n;
    if (!street && (mixture === true || mixture === undefined && mixed)) {
      companions(id).forEach(function (w) { selection[w] = 3; });
    }
    s.hero.weapons = {};
    P.Progression.debugGrant(s, { weapons: selection });
    s.hero.x = 0; s.hero.y = C.startY; s.hero.invuln = Infinity;
    s.obj = null; s.mod = null; s.eczane = null;
    // The fixture supplies all enemies. Bypass the live route's triggers, budget and hold.
    s.gen.marks = []; s.gen.routeSpent = Infinity; s.props.shutterOpen = true;
    s.dir.civilians = [];
    if (s.env) s.env.portals = [];
    s.weaponLab = { refillAt: C.refillDelay, street: street };
    if (street) {
      var K = P.CFG.env.streetWeapon, stall = prop === 'lx_stall';
      var size = stall ? P.CFG.levels.kinds[prop] : [K.labW, K.labH];
      if (stall) s.theme = 'eminonu';
      P.Env.addSolid(s, prop, K.labX, C.startY + (stall ? K.labStallAhead : 0), size[0], size[1]);
    }
    while (s.enemies.length < C.crowd && spawn(s)) { /* seeded starting crowd */ }
    s.events.length = 0;
  };

  L.step = function (s, dt, input) {
    // Keep movement and collision in the same lane. Each choice runs the selected weapon by itself.
    s.sk.streak = 0; s.sk.frenzyT = 0; s.sk.snap.length = 0; s.sk.ultT = 0;
    P.stepSim(s, dt, { x: input.x, y: input.y });
    s.hero.y = Math.max(C.startY - C.walkHalf, Math.min(C.startY + C.walkHalf, s.hero.y));
    s.drops.length = 0; s.xp = 0; s.pendingLevels = 0; s.pendingChests = 0;
    if (s.enemies.length >= C.crowd || s.runT < s.weaponLab.refillAt) return;
    s.weaponLab.refillAt = s.runT + C.refillDelay;
    var count = Math.min(C.refillCount, C.crowd - s.enemies.length);
    for (var i = 0; i < count && spawn(s); i++) { /* refill in small groups */ }
  };

  function appendGroup(ids, key) {
    var group = document.createElement('optgroup');
    group.label = P.t(key);
    ids.map(function (id) { return { id: id, label: P.t('item.' + id) }; })
      .sort(function (a, b) { return a.label.localeCompare(b.label, P.lang); })
      .forEach(function (entry) {
        var option = document.createElement('option');
        option.value = entry.id; option.textContent = entry.label; group.appendChild(option);
      });
    pick.appendChild(group);
  }

  function updateControls() {
    var evolved = evos.indexOf(weapon) >= 0, street = !!streetChoices[weapon];
    panel.classList.toggle('running', running);
    panel.classList.toggle('street', street);
    ranks.forEach(function (button, i) {
      button.disabled = evolved || street;
      button.setAttribute('aria-pressed', String(!button.disabled && rank === i + 1));
    });
    mix.disabled = street;
    start.textContent = P.t(running ? 'wlab.reset' : 'wlab.start');
    note.textContent = street ? P.t(weapon === 'streetStall' ? 'wlab.stallNote' : 'wlab.cartNote') : mixed ? P.t('wlab.also', {
      names: companions(weapon).map(function (id) { return P.t('item.' + id); }).join(', ')
    }) : P.t(evolved ? 'wlab.evoNote' : 'wlab.note', { n: C.crowd });
  }

  L.setRunning = function (active) { running = active; updateControls(); };

  L.mount = function (run) {
    var byId = function (id) { return document.getElementById('weapon-lab' + id); };
    mix = byId('-mix');
    panel = byId(''); pick = byId('-weapon');
    ranks = ['-one', '-two', '-three', '-four', '-five'].map(byId);
    start = byId('-start'); note = byId('-note');
    appendGroup(base, 'wlab.base'); appendGroup(evos, 'wlab.evos');
    [['streetCart', 'wlab.cart'], ['streetStall', 'wlab.stall']].forEach(function (entry) {
      var option = document.createElement('option');
      option.value = entry[0]; option.textContent = P.t(entry[1]); pick.appendChild(option);
    });
    var preview = new URLSearchParams(location.search).get('street');
    if (preview === '1') weapon = 'streetCart';
    if (preview === 'stall') weapon = 'streetStall';
    pick.value = weapon;
    function restart() { run(weapon, evos.indexOf(weapon) >= 0 ? 1 : rank); }
    function toggleMix() {
      mixed = !mixed;
      mix.setAttribute('aria-pressed', String(mixed));
      updateControls();
      if (running) restart();
    }
    mix.addEventListener('click', toggleMix);
    if (new URLSearchParams(location.search).get('mix') === '1') toggleMix();
    function changeRank(n) {
      if (rank === n) return;
      rank = n;
      updateControls();
      if (running) restart();
    }
    pick.addEventListener('change', function () { weapon = pick.value; updateControls(); if (running) restart(); });
    ranks.forEach(function (button, i) {
      var n = i + 1;
      button.textContent = String(n);
      button.setAttribute('aria-label', P.t('wlab.rankBtn', { n: n }));
      button.addEventListener('click', function () { changeRank(n); });
    });
    start.addEventListener('click', restart);
    updateControls();
    panel.classList.remove('hidden');
  };

  return L;
})();
