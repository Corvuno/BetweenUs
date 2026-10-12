# The Keeper — Between Us

The project-specific half of the Keeper. The general process is in
`.claude/skills/keeper/SKILL.md`; this file says what it means for Between Us.

## Name

The Keeper. Started with `/keeper`.

## The areas

**A) The deck** — questions, categories and chapters, as one layered whole.
- Card text lives only in `questions.js`. Categories and chapters are records in
  `config.js` (the CATEGORIES table: label, colour, band, focus, chapter, bucket, …).
  The bench, house style, retired names and change log are in
  `questions/between-us-deck.md`.
- Way of working: CLAUDE.md's card rules apply in full and are the strictest in the repo.
  Card proposals are issue cards (plain text, never a code block), three alternatives that
  differ in substance, the current card quoted in full, cards always cited as
  `Category, number, "question text"`. Before proposing, work out what the card is meant to
  get out of people, then write the question. The owner approves the exact words of every
  card before it is written. No exceptions, including on the fast path.
- Builder: `deck-builder`.

**B) Looks** — how anything appears: colours, lines, type, layout, card faces, animation.
- Way of working: agreement first (what it's for, what it should feel like), then rounds of
  real mockups. Every round shows the current design next to the options, each round gets
  its own new artifact link (never overwrite a round the owner has seen), and you explain why
  each option works or doesn't without picking one. The builder builds only from the mockup
  the owner chose. Follows `DESIGN-SYSTEM.md`.
- Builder: `looks-builder`.

**C) How the app works** — behaviour, screens, flows, settings, profiles, saving, offline.
- Way of working: plain-language options with trade-offs, decided by the owner.
- Builder: `app-builder`.

**Testing:** one generic `tester` for all areas, on Sonnet. It tests the app the way a player
meets it, so cross-area breakage shows up.

## How the areas pull on each other

Make these explicit whenever a wish touches one of them:
- A new or changed category or chapter (A) changes the selection screens and filters (C), and
  usually needs a colour and a place on screen (B).
- A looks change (B) can change how something works (C), e.g. moving or hiding a control.
- A chapter change (A) changes what "Draw" plays by default (C, `DEFAULT_SELECTION` in
  `config.js`) and the chapter colours (B).

## Report extras

On top of the general report: any card that changed is cited in full, old and new
(`Category, number, "question text"`).

## Things every builder must know (also in their own files)

- `between-us.html` is the one real shell. `between-us-work.html` and `between-us-dev.html`
  are redirects; never edit them.
- Every `?v=` cache-busting value in `between-us.html` is bumped together when CSS/JS changes.
- Tests: `node tests/run.mjs between-us.html` (see `tests/README.md`).
- Every commit touching the app or deck ends with the `Change:` / `Note:` lines from CLAUDE.md.
