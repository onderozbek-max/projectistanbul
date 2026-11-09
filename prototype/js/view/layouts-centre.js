// Centre landmarks for generated levels (AUDIT-6 B3): one 3 x 3 m landmark per hood, from journey.js `centre`.
// The sim names the block 'cm_' + spec with ':' removed ('tea:1' -> cm_tea1); the trailing digit is a palette variant.
// Painters register into P.Props with the same contract as istanbul-props.js: fn(c, X, Y, s, o), s = px per metre.
P.LayoutsCentre = (function () {
  var H = P.Props.h, PAL = ['#C0392B', '#2E6E8E', '#C9A227', '#2E7D4F'], GREEN = ['#2E7D4F', '#6A9E3A', '#7CB342'];
  var RECIPE = {};
  function pal(v) { return PAL[v % PAL.length]; }

  RECIPE.tram_stop = function (c, X, Y, s) {
    H.shadow(c, X, Y, 1.4 * s, 0.6 * s);
    H.rc(c, X, Y, 2.8 * s, 2.4 * s, '#C9C2B0', 1.5);
    H.rc(c, X, Y - 0.2 * s, 2.2 * s, 0.9 * s, '#9FC6D6', 1.5);
    H.rc(c, X, Y - 0.85 * s, 2.8 * s, 0.25 * s, '#4A525C', 1.5);
    H.rc(c, X - 1.0 * s, Y + 0.6 * s, 0.8 * s, 0.25 * s, '#7A5530', 1);
  };

  RECIPE.tea = function (c, X, Y, s, v) {
    H.shadow(c, X, Y, 1.1 * s, 0.5 * s);
    H.ell(c, X, Y, 1.0 * s, 0.7 * s, pal(v), 1.5);
    H.ell(c, X, Y, 0.6 * s, 0.4 * s, '#F4EBDD', 1);
    H.teaGlass(c, X - 0.4 * s, Y + 0.1 * s, s);
    H.teaGlass(c, X + 0.4 * s, Y - 0.1 * s, s);
  };

  RECIPE.booth = function (c, X, Y, s, v) {
    H.shadow(c, X, Y, 1.4 * s, 0.6 * s);
    H.box(c, X, Y, 2.4 * s, 1.8 * s, 1.1 * s, '#E8DCC6', '#8A6A4A');
    H.rc(c, X, Y - 2.0 * s + 0.3 * s, 2.6 * s, 0.5 * s, pal(v), 1.5);
    H.rc(c, X, Y + 0.35 * s, 1.2 * s, 0.6 * s, '#3B3A40', 1);
  };

  RECIPE.pyramid = function (c, X, Y, s, v) {
    var cols = [pal(v), '#E9A23B', '#F2C14E', '#7A4F8C'];
    H.shadow(c, X, Y, 1.4 * s, 0.6 * s);
    H.rc(c, X, Y, 2.6 * s, 2.6 * s, '#B8864B', 1.5);
    [[-0.6, 0.4], [0.6, 0.4], [0, -0.3], [-0.5, -0.6], [0.5, -0.6], [0, -0.9]].forEach(function (p, i) {
      H.ell(c, X + p[0] * s, Y + p[1] * s, 0.45 * s, 0.36 * s, cols[i % cols.length], 1.5);
    });
  };

  RECIPE.fountain = function (c, X, Y, s) {
    H.shadow(c, X, Y, 1.4 * s, 0.7 * s);
    H.ell(c, X, Y, 1.3 * s, 1.0 * s, '#C9C2B0', 1.5);
    H.ell(c, X, Y, 1.1 * s, 0.85 * s, '#5FA8C6', 1.2);
    H.ell(c, X, Y - 0.2 * s, 0.25 * s, 0.2 * s, '#B0E0F0', 0);
    H.glow(c, X, Y - 0.3 * s, 0.6 * s, 0.25);
  };

  RECIPE.rack = function (c, X, Y, s, v) {
    var i;
    H.shadow(c, X, Y, 1.3 * s, 0.5 * s);
    H.ln(c, X - 1.2 * s, Y - 0.6 * s, X + 1.2 * s, Y - 0.6 * s, '#14151F', 2);
    for (i = -2; i <= 2; i++) H.rc(c, X + i * 0.5 * s, Y - 0.2 * s, 0.32 * s, 0.7 * s, i % 2 ? pal(v + 1) : GREEN[(i + 2) % 3], 1);
    H.rc(c, X - 1.2 * s, Y + 0.1 * s, 0.12 * s, 0.9 * s, '#3A3E45', 0);
    H.rc(c, X + 1.2 * s, Y + 0.1 * s, 0.12 * s, 0.9 * s, '#3A3E45', 0);
  };

  RECIPE.shelter = function (c, X, Y, s) {
    H.shadow(c, X, Y, 1.3 * s, 0.6 * s);
    H.box(c, X, Y, 2.6 * s, 1.6 * s, 0.9 * s, '#9FC6D6', '#4A525C');
    H.rc(c, X, Y - 1.2 * s, 2.8 * s, 0.3 * s, '#3A3E45', 1.5);
    H.rc(c, X, Y + 0.5 * s, 1.8 * s, 0.25 * s, '#7A5530', 1);
  };

  RECIPE.cart = function (c, X, Y, s, v) {
    H.shadow(c, X, Y, 1.2 * s, 0.5 * s);
    [-1, 1].forEach(function (sx) { H.ell(c, X + sx * 1.0 * s, Y + 0.7 * s, 0.22 * s, 0.22 * s, '#1E1F25', 1.2); });
    H.box(c, X, Y, 2.2 * s, 1.4 * s, 0.7 * s, '#B8864B', '#7A5530');
    H.ell(c, X, Y - 0.9 * s, 1.4 * s, 0.7 * s, pal(v), 1.5);
  };

  RECIPE.gate = function (c, X, Y, s, v) {
    H.shadow(c, X, Y, 1.4 * s, 0.6 * s);
    H.box(c, X - 1.0 * s, Y, 0.6 * s, 1.0 * s, 1.6 * s, '#D9CBB0', '#8E7F66');
    H.box(c, X + 1.0 * s, Y, 0.6 * s, 1.0 * s, 1.6 * s, '#D9CBB0', '#8E7F66');
    H.rc(c, X, Y - 1.6 * s, 2.6 * s, 0.5 * s, pal(v), 1.5);
  };

  RECIPE.grill = function (c, X, Y, s) {
    var i;
    H.shadow(c, X, Y, 1.2 * s, 0.5 * s);
    H.rc(c, X, Y, 2.2 * s, 1.4 * s, '#3A3E45', 2);
    for (i = -2; i <= 2; i++) H.ln(c, X - 1.0 * s, Y + i * 0.25 * s, X + 1.0 * s, Y + i * 0.25 * s, '#B8B8B8', 1.5);
    H.glow(c, X, Y, 1.2 * s, 0.3);
  };

  RECIPE.garden = function (c, X, Y, s, v) {
    H.shadow(c, X, Y, 1.4 * s, 0.6 * s);
    H.box(c, X, Y, 2.6 * s, 1.8 * s, 0.4 * s, '#B8864B', '#7A5530');
    H.ell(c, X - 0.6 * s, Y - 0.5 * s, 0.6 * s, 0.5 * s, GREEN[0], 1.5);
    H.ell(c, X + 0.5 * s, Y - 0.4 * s, 0.7 * s, 0.6 * s, GREEN[1], 1.5);
    H.ell(c, X, Y - 0.1 * s, 0.25 * s, 0.25 * s, pal(v), 1);
  };

  RECIPE.drums = function (c, X, Y, s, v) {
    H.shadow(c, X, Y, 1.4 * s, 0.6 * s);
    [[-0.7, 0.3], [0.7, 0.3], [0, -0.5]].forEach(function (p, i) {
      H.box(c, X + p[0] * s, Y + p[1] * s, 0.9 * s, 0.9 * s, 0.9 * s, i === 2 ? pal(v) : '#3E6A8A', '#264A63');
    });
  };

  RECIPE.mooring = function (c, X, Y, s, v) {
    H.shadow(c, X, Y, 1.2 * s, 0.5 * s);
    H.ln(c, X - 1.0 * s, Y - 0.2 * s, X, Y + 0.6 * s, '#C9A227', 2.2);
    H.ln(c, X, Y + 0.6 * s, X + 1.0 * s, Y - 0.2 * s, '#C9A227', 2.2);
    [-1, 1].forEach(function (sd) { H.ell(c, X + sd * 1.0 * s, Y, 0.25 * s, 0.2 * s, '#3A3E45', 2); });
    H.ell(c, X, Y - 0.8 * s, 0.3 * s, 0.3 * s, pal(v), 1.5);
  };

  // The 20 spec names journey.js uses (13 recipes, digit = variant).
  var SPECS = ['tram_stop', 'tea', 'tea1', 'tea2', 'booth', 'booth1', 'booth2', 'booth3', 'pyramid', 'fountain', 'rack',
    'shelter', 'cart1', 'cart2', 'gate', 'grill', 'garden', 'garden1', 'drums', 'mooring'];
  SPECS.forEach(function (name) {
    var m = name.match(/(\d)$/), v = m ? +m[1] : 0, fn = RECIPE[name.replace(/\d$/, '')];
    P.Props.reg('cm_' + name, function (c, X, Y, s) { fn(c, X, Y, s, v); });
  });
  return { specs: SPECS };
})();
