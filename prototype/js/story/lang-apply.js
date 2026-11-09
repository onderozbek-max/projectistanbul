// Native-language text (v0.7). Story and UI lines are written separately per language, not translated:
// P.LangText[lang][id] overrides P.LINES[id] (TR column 1, EN column 2) or P.STR[lang][id].
// Bark pools live in P.BarkPools[lang][poolKey] (read by barks.js). Loaded after all string files.
(function () {
  var col = { tr: 1, en: 2 };
  Object.keys(P.LangText || {}).forEach(function (lang) {
    var map = P.LangText[lang];
    Object.keys(map).forEach(function (id) {
      if (P.LINES[id]) P.LINES[id][col[lang]] = map[id];
      else if (P.STR[lang]) P.STR[lang][id] = map[id];
    });
  });
})();
