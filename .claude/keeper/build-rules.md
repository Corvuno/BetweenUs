# Build rules — for everyone who builds

How this app is built and checked. Read before a build, with the part for your area.

## Scope

- Build what the backlog item asks. When it leaves a choice open, or something outside it seems
  needed, stop and report rather than decide. If a small change to the ask would make the job much
  simpler, say so first.
- Leave alone what the item doesn't name. Card text in `questions.js` is only written from exact
  approved words.
- A builder doesn't commit or push; the Keeper lands the work.

## How the app is built

- Plain HTML/CSS/JS, no build step, nothing newer than ES2021. `README.md` ("File layout") says
  which module owns what; they load in a fixed order and share globals.
- `between-us.html` is the one real page; the work and dev pages only redirect to it.
- Profiles live in `PROFILES` in `config.js`, categories and chapters in `categories.js`. A change
  works in every profile it reaches, and changes the record rather than what is derived from it.
- A new file the app loads may need adding to `sw.js` (the offline copy).
- When a `.js` or `.css` file changes, bump every `?v=` in `between-us.html` together.

## How the code is written

- Modern, simple and in one place: the named values from `DESIGN-SYSTEM.md`, no magic numbers, no
  `!important`, no layers or fallbacks "just in case".
- Fix the cause where the decision is made, not the symptom. Reuse what exists; remove what your
  change makes dead.

## Checks

- Run what `CHECKS.md` ("Which checks a build runs") names for your change, and see it run. A
  finding you added is fixed in the code, never in the baseline.
- A change to the page, `styles.css` or an app script runs the whole-screen comparison; a
  difference outside the intended area is reported.
- A bug fix finds the root cause first (`systematic-debugging`) and comes with a test that clicks
  through the player's steps, failing before and passing after.
- When a change makes a new screen state possible, try the controls on that screen in that state.
- A change to how cards are chosen is checked for speed on the biggest hand and at the extreme hand
  sizes. Freshness beats variety: an unseen card outranks every other quality.

## Review checklist

The builder of a small change checks 1, 6 and 8; the `checker` uses all of them.

1. It does what the item says, traced with a real case.
2. It lives where this kind of thing lives in this app.
3. Nothing copied that already exists.
4. No needless globals, dead code, magic numbers or hacks; readable names.
5. Saved data still reads; every profile works; Spotlight and the main screen stay in step; `?v=`
   bumped together.
6. It is the simplest code that does the job.
7. Touched code is in modern style.
8. A bug fix comes with a test that reproduces the bug.

## Per area

- **Deck:** read `cards.md`. Write only the exact approved words, and re-read every card you
  wrote. A retired category name goes to the archive in `questions/between-us-deck.md`.
- **Looks:** read `DESIGN-SYSTEM.md`, `look.md` and the screen's file in `design/`; take values
  from the chosen design and update the screen's file in the same job. CSS lives in `styles.css`,
  markup in `between-us.html`; category colours come from `categories.js` untouched. Look at
  phone, tablet and wide widths (wide shots need `--disable-gpu --use-gl=swiftshader`), and at
  motion at real speed.
- **How the app works:** click through the change in a real browser, with what sits next to it,
  in every profile it reaches.
- **Words a player reads** follow `look.md`, "Words in the app".

## Report back

In plain words: what changed and how it behaves now, the checks run and their results, anything
you couldn't do or that differs from the item, and a suggested `Change:` size and `Note:` line.
