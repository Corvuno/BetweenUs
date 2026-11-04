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

Which of these a build runs: `CHECKS.md`, "Which browser checks a build runs" (owner,
2026-11-04: what the change hits plus a smoke check; GitHub runs everything on main).
Run the full suite after a change to the app's shared state/deck/session code (see `CHECKS.md`), against all
three HTML files — they're kept behaviourally identical (see the root
README's "Build profiles" section).
