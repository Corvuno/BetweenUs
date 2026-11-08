# Build rules — for every builder

Read in full before every job, together with your own agent file.

## Scope

- Build only what the backlog item asks. Something that seems needed but isn't in it, or a choice
  it leaves open, is reported, not decided.
- Never remove, replace or redraw anything the item doesn't name; a seeming clash with a rule is a
  question for the Keeper.
- Never touch card text in `questions.js`, unless you are the deck builder with the exact words.
- Don't commit or push. The Keeper lands your work.
- If the job as asked is very complex and a small change to what is asked would make it much
  simpler, stop and report that before building.
- Changing a file outside the item's Touches: stop and report first.

## How the app is built

- No build step: plain HTML/CSS/JS. `README.md` ("File layout") says which `*.js` module owns what;
  they load in a fixed order and rely on globals declared before them.
- `between-us.html` is the one real shell. `between-us-work.html` and `between-us-dev.html` are
  redirects: never edit them.
- Profiles (public, work, editor) are blocks in `PROFILES` at the top of `config.js`; a change must
  behave correctly in every profile it reaches.
- Categories and chapters are the CATEGORIES table in `categories.js`; change the record, not its
  projections.
- `sw.js` is the offline copy; a new file the app loads may need adding there.
- When any `.js` or `.css` file changes, bump every `?v=` value in `between-us.html` together, to a
  value `origin/main` doesn't already carry. The Keeper re-checks it right before landing.
- App code uses no API newer than ES2021.

## How the code is written

- Modern JavaScript: `const`/`let`, arrow functions, template strings, `?.` and `??`, array methods,
  `Set`/`Map`, small pure functions instead of reaching into globals.
- Modern CSS: the `DESIGN-SYSTEM.md` tokens, flex/grid, `clamp()`, logical properties; no magic
  numbers that should be a named value; no `!important`.
- Fix the cause, not the symptom: a rule goes where the decision it shapes is made. One place per
  rule. No workaround on top of a workaround; report one if you find it.
- Reuse what exists; remove what your change makes dead.
- Names say what a thing is; a short comment only where the why isn't obvious.
- Everything your change touches leaves in modern style; whole files you only pass through are not
  rewritten.
- The simplest code that does the job: no extra layers, options, fallbacks or retries "just in
  case". If a first version needs several passes or special cases, find the one-pass idea first.

## Checks

- Run the checks in `CHECKS.md`, "Which checks a build runs": the smoke run and the checks for your
  own addition. The full suite, type check and lint are GitHub's. Setup is in `tests/README.md`;
  Playwright's Chromium is preinstalled, never run `playwright install`.
- Don't run `npm run check:static` by hand: the push lock runs it. A finding you added is fixed in
  the code, never in the baseline; a finding your change removed means `npm run check:baseline`.
- Every bug fix adds a test that drives the player's exact steps with real clicks, waits for
  animations to settle, fails on the old code and passes on the new. Report both runs.
- A check that fails is rerun at most three times to tell a flaky check from a bug, and its cause is
  still found; never "probably flaky".
- Never report "tests pass" without having seen them run in this job. If the test run won't start,
  say so.
- When a change lets a screen state occur that couldn't before, try every control on that screen in
  that state.
- When a fix removes a case, check that every behaviour already promised for it still holds.
- On a bug, find the root cause with `systematic-debugging` first. Before reporting done, follow
  `verification-before-completion`.
- Measure speed on the biggest case (All, CPU ×4) against the old code when you change how cards are
  chosen, and test the extreme hand sizes (20, All).

## Review checklist

A small change is reviewed by its own builder against points 1, 6 and 8. The `reviewer` uses all of
them on medium and large builds.

1. The logic does what the item says, traced with a real case. A rule that runs after the decision
   it should shape is a bug.
2. It lives in the file and layer where this kind of thing lives in this app.
3. No copied logic, styles or values that already exist (`DESIGN-SYSTEM.md` tokens, shared helpers).
4. No needless globals, dead code, magic numbers or hacks; readable names.
5. Saved data still reads correctly in old and new code; every profile works; Spotlight and the main
   screen stay in step; `?v=` values bumped together.
6. It is the simplest code that does the job.
7. Touched code is in modern style.
8. A bug fix comes with a test that reproduces the bug.

## Words in anything a player reads

- "Draw" for every card action; nothing is dealt; no gambling or card-table words.
- No internal names (project.md, "Player-facing words").
- Copy never talks down to the player; one adult to another.
- Copy about stored things says only what the app knows.
- Text a player has to read is never small, muted print.

## Report back

In plain words: what you changed and how it behaves now, the checks you ran and their results,
anything nearby you checked, your review against the checklist when you were the only agent, and
anything you couldn't do or that differs from the item. Suggest the commit's `Change:` size and
`Note:` line.
