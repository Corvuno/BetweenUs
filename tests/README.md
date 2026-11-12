# Regression harness

A plain Node script, not a test framework — this app has no build step, so
its tests don't get one either. It drives the real HTML file in a real
headless Chromium and asserts on real DOM state: deck load, tap/swipe/skip/
hold, keyboard arrows, category toggles, the draw-three picker, drawers,
After Dark, and fullscreen party mode.

## Setup

Cloud sessions: nothing to do. `run.mjs` first tries the local `playwright`
package; if it isn't installed it falls back to the shared copy at
`/opt/node-tools/node_modules/playwright`, which uses the preinstalled Chromium
in `/opt/pw-browsers` (`PLAYWRIGHT_BROWSERS_PATH`). Never run
`playwright install` there.

Local machine (one-time):

```
cd tests && npm install && npx playwright install chromium
```

## Run

```
node tests/run.mjs between-us.html        # default
node tests/run.mjs between-us-work.html
node tests/run.mjs between-us-dev.html
```

Exits non-zero if any check fails, with the failing assertion printed inline.

```
node tests/run.mjs --smoke                       # 7 core checks, about 10 seconds
node tests/run.mjs --smoke --only=wildcard,tilt  # plus the checks whose name holds a word
```

Which of these a build runs: `CHECKS.md`, "Which checks a build runs" (owner, 2026-11-04: the
smoke run and the checks for the change's own addition; GitHub runs everything on main).
The full suite runs on GitHub on every push to main (see `CHECKS.md`); it covers all
three HTML files — they're kept behaviourally identical (see the root
README's "Build profiles" section).

## Visual diff

`tests/visual-diff.mjs` compares whole-screen pictures of the app before and after a change and fails
when anything changed outside the area the change was allowed to touch. It needs no setup beyond the
Playwright lookup above, and no model has to look at the pictures when it passes.

```
node tests/visual-diff.mjs --allow='#btn-next'          # the change may alter #btn-next, nothing else
node tests/visual-diff.mjs                              # nothing may change at all
```

- "Before" is `origin/main` (`--base=<git ref>`), exported with `git archive` into a temp directory;
  the working tree, index and branch are never touched. "After" is the working tree
  (`--after-dir=<dir>` for another copy).
- It photographs six moments on a phone (412x915) and a wide screen (1440x900): the start card, a card
  in a hand, The Deck sheet, the menu, Spotlight and the end of a hand. `--only=<word>` limits the
  moments, `--phone` / `--wide` the devices.
- `--allow=<selector>[,<selector>]`: a difference inside the box of a matching element (before or after
  page, padded a few pixels) is allowed. Every difference is named in words with its place and size.
- Exit 0: nothing outside the allowed area. Exit 1: something is, or a moment could not be reached.
  Before, after and highlighted pictures of failing moments go to `--out=<dir>` (default: a new temp
  directory, printed), never into the repo.
- Runs are deterministic (fixed random numbers and clock, clean storage, reduced motion, fonts loaded,
  animations finished, each picture repeated until two in a row match). Groups of six or fewer
  differing pixels are glyph-edge noise and ignored.
