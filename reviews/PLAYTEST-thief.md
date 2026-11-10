# Playtest: the thief (marti) from H05 on, A/B

**Why:** the bot clears L43 about 60% slower with the thief on (405 s vs 254 s) but dies less. The bot is a poor judge of feel, so this is a human call.
**How:** play each level twice on the **same seed**, once with the thief (A) and once without (B, `&thief=0`). Same save, same build both times.
Open in the browser (desktop or phone) from `prototype/index.html`. Tap START if the title shows.

| Level | Where | Look | A: thief on | B: thief off |
|---|---|---|---|---|
| L22 | Eminönü, the first thief | seagull | `index.html?level=22&seed=22&skipintro=1` | `index.html?level=22&seed=22&skipintro=1&thief=0` |
| L37 | Beyazıt | pigeon | `index.html?level=37&seed=37&skipintro=1` | `index.html?level=37&seed=37&skipintro=1&thief=0` |
| L43 | Kumkapı, the bot's worst case | seagull | `index.html?level=43&seed=43&skipintro=1` | `index.html?level=43&seed=43&skipintro=1&thief=0` |

(Prefix with `file:///Users/o0o02dn/Documents/istanbul/prototype/` if you open them by path.) Same seed gives the same level, but the crowd mix shifts a little
when the thief is off, so compare feel, not exact numbers.

## What to watch (one minute each, then fill the table)
1. **Do you chase it?** When it grabs your XP drop, do you run after it, or ignore it and keep moving? Chasing is what would stretch the clock.
2. **Does it feel like a fair pest or a time sink?** The intended feel: a small, funny theft you can punish (kill it, get the XP and gold back with a bonus).
3. **Does the level drag?** Note the clock at the end (top of the screen) for A and B.
4. **Pigeon vs seagull.** On L37, can you tell at a glance it is a pigeon, in flight and on the ground? On L22 and L43, is it clearly the seagull?
5. **Cats and birds.** Any cat or bird that blocks you, distracts you, or looks like an enemy? (They should never.)

## Record

| Level | A clock | B clock | Chased it? (always / sometimes / never) | Fair pest or time sink? | Pigeon readable? | Notes |
|---|---|---|---|---|---|---|
| L22 | | | | | n/a | |
| L37 | | | | | | |
| L43 | | | | | n/a | |

## How I will read it
- B and A within about 15% on the clock, and you rarely chase it: **keep the thief everywhere from H05**. The bot number is a policy artifact.
- A clearly longer and you chase it every time: **cap it** (one live thief at most, or start at stage 3). A one-line config change.
- The pigeon is unreadable in flight: art fix (a darker body, a visible neck patch), not a placement change.
