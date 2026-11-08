// Inline SVG icon set (view layer). 48x48 viewBox, comic-ink style:
// #14151F outlines at stroke-width 2.5 (round joins), flat fills, exactly one
// white 35% highlight per icon, no text, no gradients, no external assets.
// Usage: P.Icons.svg('knife', 32) -> '<svg ...>...</svg>'. Unknown id -> dashed placeholder.
P.Icons = (function () {
  var INK = '#14151F';
  var OUT = ' stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"';
  var STEEL = '#C9CED6', DSTEEL = '#5E636B', LEATHER = '#6B3E26', PAPER = '#F4EBDD', STONE = '#8A8F98';
  var RED = '#D7263D', GOLD = '#E9A23B', AMBER = '#B5651D', BLUE = '#1B4965', CYAN = '#3DDCFF';

  // Outlined filled shapes.
  function path(d, fill) { return '<path d="' + d + '" fill="' + fill + '"' + OUT + '/>'; }
  function rect(x, y, w, h, rx, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + fill + '"' + OUT + '/>';
  }
  function ellipse(cx, cy, rx, ry, fill) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + OUT + '/>';
  }
  function circle(cx, cy, r, fill) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + OUT + '/>'; }
  // Open strokes; halo=true puts the ink outline underneath the coloured stroke.
  function line(d, col, w, halo) {
    var a = ' fill="none" stroke-linecap="round" stroke-linejoin="round"';
    return (halo ? '<path d="' + d + '"' + a + ' stroke="' + INK + '" stroke-width="' + (w + 2.5) + '"/>' : '') +
      '<path d="' + d + '"' + a + ' stroke="' + col + '" stroke-width="' + w + '"/>';
  }
  // The one highlight per icon: white at 35% opacity.
  function hi(d) { return '<path d="' + d + '" fill="#fff" fill-opacity=".35"/>'; }
  function hiLine(d, w) {
    return '<path d="' + d + '" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="' + w + '" stroke-linecap="round"/>';
  }
  function rivet(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="1.8" fill="' + STEEL + '" stroke="' + INK + '" stroke-width="1.4"/>'; }
  function pt(a, r) { return (24 + r * Math.cos(a)).toFixed(2) + ' ' + (24 + r * Math.sin(a)).toFixed(2); }

  function starPath(cx, cy, R, r) {
    var d = '', i, a, k;
    for (i = 0; i < 10; i++) {
      a = (i * 36 - 90) * Math.PI / 180; k = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + k * Math.cos(a)).toFixed(2) + ' ' + (cy + k * Math.sin(a)).toFixed(2);
    }
    return d + 'Z';
  }
  function gearPath(n, ro, ri) {
    var st = 2 * Math.PI / n, d = '', i, a;
    for (i = 0; i < n; i++) {
      a = i * st;
      d += (i ? ' A' + ri + ' ' + ri + ' 0 0 1 ' : 'M') + pt(a - 0.26 * st, ri) +
        ' L' + pt(a - 0.16 * st, ro) + ' L' + pt(a + 0.16 * st, ro) + ' L' + pt(a + 0.26 * st, ri);
    }
    return d + ' A' + ri + ' ' + ri + ' 0 0 1 ' + pt(-0.26 * st, ri) + 'Z';
  }
  // One chain link: ink halo + steel ring, rotated to the chain tangent.
  function link(x, y, a) {
    var t = ' transform="translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + a.toFixed(1) + ')"';
    var r = '<rect x="-6" y="-4" width="12" height="8" rx="4" fill="none"' + t;
    return r + ' stroke="' + INK + '" stroke-width="5.3"/>' + r + ' stroke="' + STEEL + '" stroke-width="2.8"/>';
  }

  var DRAW = {
    knife: function () {
      return '<g transform="rotate(45 24 24)">' +
        path('M14.5 28L15 9C15.5 4.5 19.5 1.5 26 2C31 6 35.5 13 35 28Z', STEEL) +
        hi('M18.5 24C18.2 16 19.2 10 22 6.5C20.8 11.5 20.6 17.5 21 24Z') +
        rect(18.5, 30, 11, 15, 4.5, LEATHER) +
        rect(12.5, 26.5, 23, 5, 2, DSTEEL) +
        rivet(24, 35) + rivet(24, 40.5) +
        '</g>';
    },

    nailgun: function () {
      return path('M6 14H36Q42 14 42 20V22Q42 26 37 26H30L27 42H17L20 26H6Z', GOLD) +
        rect(2, 16, 6, 8, 2, DSTEEL) +
        path('M20 26H30L28.5 33H19Z', '#3A3A3A') +
        rect(28, 29, 9, 3, 1.5, DSTEEL) +
        line('M44 19H47', STEEL, 2.4) +
        hi('M10 16.5H35V18.5H10Z');
    },

    canister: function () {
      return path('M12 20A12 4 0 0 1 36 20V40A12 4 0 0 1 12 40Z', BLUE) +
        path('M12 27A12 4 0 0 0 36 27V33A12 4 0 0 1 12 33Z', RED) +
        ellipse(24, 20, 12, 4, DSTEEL) +
        path('M21 20.5V15.5Q21 12.5 24 12.5Q27 12.5 27 15.5V20.5Z', GOLD) +
        path('M39 2.5L40.6 7.4L45.5 9L40.6 10.6L39 15.5L37.4 10.6L32.5 9L37.4 7.4Z', GOLD) +
        hi('M15 24H16.5V36H15Z');
    },

    chain: function () {
      var out = '', i, t, a;
      for (i = 0; i < 10; i++) {
        t = i * Math.PI / 5;
        a = Math.atan2(11 * Math.cos(t), -15 * Math.sin(t)) * 180 / Math.PI + (i % 2 ? 90 : 0);
        out += link(24 + 15 * Math.cos(t), 24 + 11 * Math.sin(t), a);
      }
      return out + hi('M12.5 20.5Q14 13.5 21 11.5L20.5 13.5Q15.5 15 14 21Z');
    },

    shoes: function () {
      return path('M8 19C8 17 10 16 12 17L17 20L21 14Q24 12 26 15L30 21Q36 22 40 27Q44 30 43 32L8 32Z', RED) +
        line('M20.5 20.5L24 18.5M24 23L28 21M28.5 25.5L32 23.5', PAPER, 2.2) +
        rect(4, 30, 41, 8, 4, PAPER) +
        hi('M9 22.5Q10.5 21.5 12 22.5V29.5Q10.5 30 9 29.5Z');
    },

    jacket: function () {
      return path('M17 8L12 10L5 19L8 37L13 36L14 22L14 42L34 42L34 22L35 36L40 37L43 19L36 10L31 8L24 18Z', LEATHER) +
        path('M17 8L24 18L31 8Z', PAPER) +
        '<path d="M24 19V42" fill="none" stroke="' + STEEL + '" stroke-width="2.4" stroke-linecap="round"/>' +
        line('M15 30L21 27.5M27 27.5L33 30', INK, 2) +
        hi('M9.5 20L13 12.5L15 13.5L11.5 21Z');
    },

    gloves: function () {
      return path('M15 42L11.5 33C9 29 5.5 25 5.25 20.5A3.6 3.6 0 0 1 10.5 16.5C12.5 18.5 14 21 15 24L15 12.75A3.25 3.25 0 0 1 21.5 12.75L21.5 19L21.5 8.75A3.25 3.25 0 0 1 28 8.75L28 19.5L28 10.75A3.25 3.25 0 0 1 34.5 10.75L34.5 21L34.5 15.75A2.75 2.75 0 0 1 40 15.75L40 28Q40 36 36.5 42Z', GOLD) +
        hi('M16.8 21.5V15.5Q16.8 13 19 12.8V21.5Z') +
        rect(12.5, 36.5, 25, 8, 2.5, LEATHER) +
        '<path d="M15.5 40.5H34.5" fill="none" stroke="' + PAPER + '" stroke-width="1.6" stroke-dasharray="2.2 1.8"/>';
    },

    energy: function () {
      return path('M14 12V38A10 3 0 0 0 34 38V12A10 3 0 0 0 14 12Z', CYAN) +
        ellipse(24, 12, 10, 3, STEEL) +
        path('M26.5 17L19 27H23.5L21.5 34L29 24H24.5Z', GOLD) +
        hi('M16.5 18.5H19V35.5Q17.8 36 16.5 35.5Z');
    },

    medkit: function () {
      return path('M16 17V11Q16 7 20 7H28Q32 7 32 11V17H28V12H20V17Z', RED) +
        rect(6, 15, 36, 28, 4, PAPER) +
        rect(6, 15, 36, 7, 3, STEEL) +
        path('M21 24.5H27V29.5H32V35.5H27V40.5H21V35.5H16V29.5H21Z', RED) +
        hi('M8.5 17.5H29.5V19.5H8.5Z');
    },

    simit: function () {
      var ring = 'M4.5 25A19.5 15 0 1 0 43.5 25A19.5 15 0 1 0 4.5 25ZM17.5 25A6.5 4.2 0 1 0 30.5 25A6.5 4.2 0 1 0 17.5 25Z';
      var seeds = '', i, a;
      for (i = 0; i < 14; i++) {
        a = (i * 360 / 14 + 8) * Math.PI / 180;
        seeds += '<circle cx="' + (24 + 13 * Math.cos(a)).toFixed(2) + '" cy="' + (25 + 9.6 * Math.sin(a)).toFixed(2) + '" r="1.3" fill="' + PAPER + '"/>';
      }
      return '<path transform="translate(0 3)" d="' + ring + '" fill="' + AMBER + '" fill-rule="evenodd"' + OUT + '/>' +
        '<path d="' + ring + '" fill="' + GOLD + '" fill-rule="evenodd"' + OUT + '/>' + seeds +
        hi('M8.5 21Q9.5 12.5 19 10Q13.5 14 12.8 21.5Z');
    },

    jeton: function () {
      return circle(24, 24, 16, AMBER) +
        circle(24, 21, 16, GOLD) +
        '<circle cx="24" cy="21" r="11.5" fill="none" stroke="' + AMBER + '" stroke-width="2"/>' +
        path(starPath(24, 21, 8.5, 4.2), AMBER) +
        hi('M12.5 14.5Q15 7.5 22.5 6.5Q16.5 9.5 14.5 16Z');
    },

    pause: function () {
      return rect(10, 9, 10, 30, 3, CYAN) + rect(28, 9, 10, 30, 3, CYAN) + hi('M12.5 12H15.5V36H12.5Z');
    },

    gear: function () {
      return path(gearPath(8, 18, 13.5), STEEL) + circle(24, 24, 5.5, DSTEEL) +
        hi('M12.5 22Q13.5 14.5 19.5 11.5Q15.5 15 14.5 22Z');
    },

    heart: function () {
      return path('M24 41C10 31 6 25 6 17C6 11 10 7 16 7C20 7 22.5 9.5 24 12C25.5 9.5 28 7 32 7C38 7 42 11 42 17C42 25 38 31 24 41Z', RED) +
        hi('M12 17C12 13.5 13.5 11.5 16.5 11.5C14.8 12.5 14.2 14 14.2 17Z');
    },

    skull: function () {
      return path('M24 6C14 6 9 13 9 22C9 28 12 31 15 33V40H33V33C36 31 39 28 39 22C39 13 34 6 24 6Z', STEEL) +
        '<circle cx="18.5" cy="23" r="4.2" fill="' + INK + '"/><circle cx="29.5" cy="23" r="4.2" fill="' + INK + '"/>' +
        path('M24 27.5L22 31.5H26Z', INK) +
        line('M20.5 33.5V40M24 33.5V40M27.5 33.5V40', INK, 2) +
        hi('M11.5 20C11.8 14.5 15.5 9.5 22 8.5C16.5 11 13.5 15 13 20Z');
    },

    star: function () {
      return path(starPath(24, 26, 19, 8.6), GOLD) +
        hi('M23.51 13.22L24.63 13.66L22.94 17.99L21.82 17.55Z');
    },

    clock: function () {
      return circle(24, 24, 17, CYAN) +
        line('M24 13.5V24.5L30.5 28.5', INK, 2.5) +
        hi('M11.5 19Q13 12.5 19.5 10Q14.5 13.5 14 19Z');
    },

    phone: function () {
      return line('M12 9C3.5 20 11 37 36 37.5', DSTEEL, 8, true) +
        '<rect x="3.5" y="3.5" width="17" height="11" rx="5.5" fill="' + DSTEEL + '"' + OUT + ' transform="rotate(21 12 9)"/>' +
        '<rect x="27.5" y="32" width="17" height="11" rx="5.5" fill="' + DSTEEL + '"' + OUT + ' transform="rotate(99 36 37.5)"/>' +
        hiLine('M8.5 18C8.2 21.5 9.2 25 11.5 27.5', 1.6);
    },

    lock: function () {
      return line('M15 22V15.5A9 9 0 0 1 33 15.5V22', STEEL, 4.5, true) +
        rect(9, 21, 30, 22, 5, GOLD) +
        '<circle cx="24" cy="29" r="3" fill="' + INK + '"/><path d="M22.4 31L21.4 38H26.6L25.6 31Z" fill="' + INK + '"/>' +
        hi('M12.8 25H15.2V39H12.8Z');
    },

    reroll: function () {
      return line('M31 11.9A14 14 0 0 1 24 38', CYAN, 4.5, true) +
        line('M17 36.1A14 14 0 0 1 24 10', CYAN, 4.5, true) +
        path('M18.5 38L24 31.5V44.5Z', CYAN) +
        path('M29.5 10L24 3.5V16.5Z', CYAN) +
        hiLine('M36.12 17A14 14 0 0 1 37.79 21.57', 1.6);
    },

    back: function () {
      return path('M23 10L9 24L23 38V30H39V18H23Z', CYAN) +
        hi('M23 18.5H38V20.5H23Z');
    }
  };

  // Neutral stand-in for unknown ids (no text, no fill).
  function placeholder() {
    return '<rect x="7" y="7" width="34" height="34" rx="9" fill="none" stroke="' + STONE + '" stroke-width="2.5" stroke-dasharray="5 4"/>';
  }

  return {
    svg: function (id, size) {
      var draw = Object.prototype.hasOwnProperty.call(DRAW, id) ? DRAW[id] : placeholder;
      var s = size || 48;
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="' + s + '" height="' + s +
        '" aria-hidden="true" focusable="false">' + draw() + '</svg>';
    },
    ids: Object.keys(DRAW)
  };
})();
