# Regression harness

A plain Node script, not a test framework — this app has no build step, so
its tests don't get one either. It drives the real HTML file in a real
headless Chromium and asserts on real DOM state: deck load, tap/swipe/skip/
hold, keyboard arrows, category toggles, the draw-three picker, drawers,
After Dark, and fullscreen party mode.

## Setup (one-time)

```
npm install -D playwright && npx playwright install chromium
```

## Run

```
node tests/run.mjs between-us.html        # default
node tests/run.mjs between-us-work.html
node tests/run.mjs between-us-dev.html
```

Exits non-zero if any check fails, with the failing assertion printed inline.
Run this after any change to the app's state/render/event code, against all
three HTML files — they're kept behaviourally identical (see the root
README's "Build profiles" section).
