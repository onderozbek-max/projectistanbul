// Project Istanbul low-fi wireframes: shared navigation.
// SCREENS is the single list of screens; the pager and the board are generated from it.
const SCREENS = [
  ["01-title", "Title"],
  ["02-world-map", "World map"],
  ["03-level-start", "Level start + booster"],
  ["04-run-hud", "In-run HUD (peak chaos)"],
  ["05-level-up", "Level-up cards"],
  ["06-boss", "Boss fight (Vatman)"],
  ["07-pause", "Pause"],
  ["08-results-win", "Results: win"],
  ["09-results-lose", "Results: lose + revive"],
  ["10-workshop", "Workshop (weapon mastery)"],
  ["11-skills", "Street Tree (skill tree)"],
  ["12-gear", "Gear + merge"],
  ["13-bazaar", "Grand Bazaar shop"],
  ["14-road-pass", "Road Pass"],
  ["15-store", "Store + Monthly Card"],
  ["16-settings", "Settings + accessibility"],
  ["17-motion-comic", "Motion comic"],
  ["18-letter", "Dad's letter"],
];

function currentId() {
  const file = location.pathname.split("/").pop() || "";
  return file.replace(".html", "");
}

function buildPager(el) {
  const i = SCREENS.findIndex(([id]) => id === currentId());
  if (i < 0) return;
  const link = (idx, label) =>
    idx >= 0 && idx < SCREENS.length ? `<a href="${SCREENS[idx][0]}.html">${label}</a>` : "";
  el.innerHTML =
    link(i - 1, "&larr; " + (SCREENS[i - 1] || [, ""])[1]) +
    `<a href="index.html">All screens (${i + 1}/${SCREENS.length})</a>` +
    link(i + 1, (SCREENS[i + 1] || [, ""])[1] + " &rarr;");
}

function buildBoard(el) {
  el.innerHTML = SCREENS.map(([id, name], i) => `
    <a href="${id}.html">
      <div class="thumb"><iframe src="${id}.html?phone" title="${name}" loading="lazy" tabindex="-1"></iframe></div>
      <span class="num">${String(i + 1).padStart(2, "0")}</span><strong>${name}</strong>
    </a>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  if (new URLSearchParams(location.search).has("phone")) document.body.classList.add("only-phone");
  const pager = document.getElementById("pager");
  if (pager) buildPager(pager);
  const board = document.getElementById("board");
  if (board) buildBoard(board);
});
