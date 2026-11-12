# Build rules — for everyone who builds

Read in full before every job; a builder also reads its own agent file.

## Scope

- Build only what the backlog item asks. Something that seems needed but isn't in it, a choice it
  leaves open, or a file outside its Touches: stop and report, don't decide.
- Never remove, replace, move or redraw anything the item doesn't name.
- Never touch card text in `questions.js`, unless you are the deck builder with the exact words.
- If a small change to what is asked would make the job much simpler, report that before building.
- A builder doesn't commit or push; the Keeper lands the work.

## How the app is built

- No build step: plain HTML/CSS/JS. `README.md` ("File layout") says which `*.js` module owns
  what; they load in a fixed order and rely on globals declared before them. No API newer than
  ES2021.
- `between-us.html` is the one real shell; `between-us-work.html` and `between-us-dev.html` are
  redirects and are never edited.
- Profiles (public, work, editor) are blocks in `PROFILES` in `config.js`; a change must behave
  correctly in every profile it reaches. Categories and chapters are the CATEGORIES table in
  `categories.js`: change the record, not its projections.
- `sw.js` is the offline copy; a new file the app loads may need adding there.
- When any `.js` or `.css` file changes, bump every `?v=` value in `between-us.html` together, to
  a value `origin/main` doesn't carry.

## How the code is written

- Modern JavaScript and CSS: `const`/`let`, small pure functions, the `DESIGN-SYSTEM.md` named
  values, flex/grid, `clamp()`; no magic numbers, no `!important`.
- Fix the cause, not the symptom: one place per rule, where the decision it shapes is made. No
  workaround on a workaround.
- The simplest code that does the job: no extra layers, options or fallbacks "just in case".
  Reuse what exists; remove what your change makes dead.
- Everything your change touches leaves in modern style; files you only pass through are left.

## Checks

- Run the checks in `CHECKS.md`, "Which checks a build runs": the smoke run and the checks for
  your own addition. The full suite, type check and lint are GitHub's; the push lock runs the
  static check. A finding you added is fixed in the code, never in the baseline.
- A build that touches `between-us.html`, `styles.css` or an app script runs the whole-screen
  comparison (`CHECKS.md`) with the area the item names. A difference outside that area stops the
  build and is reported, never waved through.
- Every bug fix finds the root cause first (`systematic-debugging`) and adds a test that drives
  the player's exact steps with real clicks, fails on the old code and passes on the new.
- A failing check is rerun at most three times to tell flaky from broken, and its cause is still
  found. Never report "tests pass" without having seen them run in this job.
- When a change lets a screen state occur that couldn't before, try every control on that screen
  in that state. When a fix removes a case, check what was promised for it still holds.
- A change to how cards are chosen is measured for speed on the biggest case (All, CPU ×4) and
  tested at the extreme hand sizes (20, All).

## Review checklist

Whoever built a small change checks points 1, 6 and 8; the `checker` uses all of them.

1. The logic does what the item says, traced with a real case.
2. It lives in the file and layer where this kind of thing lives in this app.
3. No copied logic, styles or values that already exist.
4. No needless globals, dead code, magic numbers or hacks; readable names.
5. Saved data still reads in old and new code; every profile works; Spotlight and the main screen
   stay in step; `?v=` values bumped together.
6. It is the simplest code that does the job.
7. Touched code is in modern style.
8. A bug fix comes with a test that reproduces the bug.

## Words a player reads

They follow `.claude/keeper/look.md`, "Words in the app", and are never small, muted print.

## Report back

In plain words: what changed and how it behaves now, the checks run and their results, anything
nearby you checked, anything you couldn't do or that differs from the item, and a suggested
`Change:` size and `Note:` line.
