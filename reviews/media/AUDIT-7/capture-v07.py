"""AUDIT-7 re-review: self-playing screenshot capture of prototype v0.7 at 390x844.

Each scenario loads the build, starts a level through P.debug.playLevel, plays with a kite pattern
(auto-picks cards and chests), and captures screenshots plus live sim stats at fixed times.
"""
import asyncio
import json
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:8765/"
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/a7/shots")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

STATS_JS = """() => {
  const s = P.debug && P.debug.sim; if (!s) return {state: P.debug && P.debug.state};
  const alive = s.enemies.filter(e => !e.dead);
  const h = s.hero, halfW = 5.2, halfH = 11;
  const onScreen = alive.filter(e => Math.abs(e.x - h.x) < halfW && Math.abs(e.y - h.y) < halfH).length;
  const vis = id => { const el = document.getElementById(id); return !!el && !el.classList.contains('hidden'); };
  return {state: P.debug.state, t: +(s.runT || 0).toFixed(1), alive: alive.length, onScreen,
          hp: Math.round(h.hp), lvl: s.level, kills: s.kills, mode: s.mode,
          overlays: ['scr-cards','scr-chest','scr-down','scr-pause','scr-results'].filter(vis)};
}"""

ADVANCE_JS = """(captureCards) => {
  const vis = id => { const el = document.getElementById(id); return !!el && !el.classList.contains('hidden'); };
  if (vis('scr-cards')) { if (captureCards) return 'cards'; const c = document.querySelector('#cards .card'); if (c) c.click(); return 'picked'; }
  if (vis('scr-chest')) { const b = document.querySelector('#scr-chest button'); if (b) b.click(); return 'chest'; }
  const comic = document.querySelector('.cm-page:not(.hidden), #comic:not(.hidden), .comic-overlay:not(.hidden)');
  if (comic) { comic.click(); return 'comic'; }
  return '';
}"""


async def play(page, seconds, shots, name, log, capture_first_cards=True):
    """Kite-play for `seconds` (wall clock), screenshot at the times in `shots`."""
    keys = [("w", "a"), ("w", "d"), ("s", "a"), ("w", "d")]
    t, step, k, cards_shot = 0.0, 0.25, 0, not capture_first_cards
    pending = sorted(shots)
    while t < seconds:
        res = await page.evaluate(ADVANCE_JS, not cards_shot)
        if res == "cards":
            await page.wait_for_timeout(500)
            await shot(page, f"{name}-levelup", log)
            cards_shot = True
            continue
        pair = keys[(k // 6) % len(keys)]
        for key in pair:
            await page.keyboard.down(key)
        await page.wait_for_timeout(int(step * 1000))
        for key in pair:
            await page.keyboard.up(key)
        t += step
        k += 1
        while pending and t >= pending[0]:
            await shot(page, f"{name}-t{int(pending.pop(0)):03d}", log)


async def shot(page, label, log):
    stats = await page.evaluate(STATS_JS)
    await page.screenshot(path=str(OUT / f"{label}.jpg"), type="jpeg", quality=82)
    log.append({"shot": label, **stats})
    print(label, json.dumps(stats), flush=True)


async def scenario(browser, name, url, level=None, seconds=0, shots=(), setup=None, clear=False):
    ctx = await browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                                    has_touch=False)
    page = await ctx.new_page()
    log, errors = [], []
    page.on("console", lambda m: errors.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    if clear:
        await page.goto(BASE)
        await page.evaluate("() => localStorage.clear()")
    await page.goto(BASE + url)
    await page.wait_for_timeout(1500)
    if setup:
        await setup(page, log)
    if level is not None:
        await page.evaluate(f"() => P.debug.playLevel({level}, {{seed: 7}})")
        await page.wait_for_timeout(800)
    if seconds:
        await play(page, seconds, shots, name, log)
    await ctx.close()
    return {"name": name, "log": log, "errors": errors[:30]}


async def title_and_map(page, log):
    await shot(page, "00-title", log)


async def open_map(page, log):
    await page.evaluate("() => P.debug.openMap()")
    await page.wait_for_timeout(1500)
    await shot(page, "map-unlockall", log)


async def fresh_map(page, log):
    await page.evaluate("() => P.debug.openMap()")
    await page.wait_for_timeout(1500)
    await shot(page, "map-fresh-save", log)


async def pause_and_settings(page, log):
    await page.evaluate("() => P.debug.playLevel(7, {seed: 7})")
    await page.wait_for_timeout(800)
    await play(page, 20, [], "pause", log, capture_first_cards=False)
    await page.keyboard.press("p")
    await page.wait_for_timeout(600)
    await shot(page, "pause-overlay", log)


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, headless=True,
                                          args=["--autoplay-policy=no-user-gesture-required"])
        plan = [
            dict(name="title", url="", setup=title_and_map, clear=True),
            dict(name="map-fresh", url="", setup=fresh_map, clear=True),
            dict(name="map", url="?meta=unlockall", setup=open_map),
            dict(name="L01", url="?skipintro=1&seed=7", level=1, seconds=95, shots=(15, 40, 70, 95)),
            dict(name="L01-segD", url="?seg=D&seed=7", level=1, seconds=45, shots=(15, 35)),
            dict(name="L05-boss", url="?skipintro=1&meta=unlockall", level=5, seconds=80, shots=(25, 50, 80)),
            dict(name="L07", url="?skipintro=1&meta=unlockall", level=7, seconds=75, shots=(25, 50, 75)),
            dict(name="L16-bridge", url="?skipintro=1&meta=unlockall", level=16, seconds=60, shots=(30, 60)),
            dict(name="L22-eminonu", url="?skipintro=1&meta=unlockall", level=22, seconds=50, shots=(25, 50)),
            dict(name="L33", url="?skipintro=1&meta=unlockall", level=33, seconds=45, shots=(45,)),
            dict(name="L63", url="?skipintro=1&meta=unlockall", level=63, seconds=45, shots=(20, 45)),
            dict(name="L88", url="?skipintro=1&meta=unlockall", level=88, seconds=45, shots=(45,)),
            dict(name="pause", url="?skipintro=1&meta=unlockall", setup=pause_and_settings),
        ]
        results = []
        for spec in plan:
            try:
                results.append(await scenario(browser, **spec))
            except Exception as exc:  # keep going; record the failure as evidence
                results.append({"name": spec["name"], "error": repr(exc)})
                print("SCENARIO FAILED", spec["name"], repr(exc), flush=True)
        await browser.close()
    (OUT / "results.json").write_text(json.dumps(results, indent=1, ensure_ascii=False))
    print("DONE", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
