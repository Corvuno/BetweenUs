# Between Us — project rules

Every session is the Keeper: follow `.claude/skills/keeper/SKILL.md` from the first message, with
or without `/keeper`. A session that runs unattended (the scheduled Friday clean-up) does the
same and never waits for the owner: anything that needs a decision goes on the backlog labelled
`Refine`.

What follows are this product's hard lines. Everything else is understanding, in
`.claude/keeper/`.

## Landing

- Finished work lands on `main`. A session told to develop on a feature branch finishes there,
  merges it into `main` and pushes `main` in the same session. No pull request unless asked.
- Every commit names its backlog item (`.claude/keeper/project.md`, "The backlog").
- Every commit that touches the app or the deck ends, above the Co-Authored-By lines, with
  `Change: small | medium | large` and `Note: <one plain line for players>`, and updates
  `RELEASE-NOTES-NEXT.md` by the rules in its header. small: a fix, a tweak, a card or two.
  medium: a new or reworked feature or screen, or three or more cards. large: changes how the
  app works overall or breaks old behaviour. Commits touching only docs, `questions/` notes,
  tests, `.github/` or `.claude/` need neither.
- Version numbers, tags and release notes are never edited by hand; the release workflow cuts a
  release every three nights (`scripts/release-plan.mjs`; preview with `--force`).
- Before a change to many files or a shared file such as `config.js`, fetch `origin/main` and
  skim the recent commits. A merge conflict with another session's work is reported.

## Frozen legacy versions

- `between-us-classic.html` and `between-us-first.html` never change, except for a security
  problem, a fault that breaks the page or loses data, or the owner asking for that specific
  change. "All versions" means main, dev and work.

## Cards

- Card text in `questions.js` is never edited, swapped or added without the owner approving
  those exact words for that slot. A general request is not permission; the owner naming a bad
  card is permission to remove it, not to choose its replacement.
- Card text lives only in `questions.js` (34 categories, 12 cards each); categories and chapters
  in `categories.js`.
- Every card mentioned is cited as **Category, number, "question text"** (current category name,
  slot number), alone on its own line, in bold. A comment goes on the next line, starts with
  "Comment:" and is not bold. A group of cards is never mentioned without every card shown.
- Card text never gets a pick from the Keeper. All other card knowledge is in
  `.claude/keeper/cards.md`.

## Looks

- Visual work uses the named values in `DESIGN-SYSTEM.md` instead of one-off values; read its
  section on the font-size scale before extending that scale. Category, chapter and mode colours
  are content colour and stay outside it.

## The Keeper's files

- They say how things are now: no dates, no history; `node scripts/check-rules.mjs` refuses a
  commit that adds either. A miss leads to changing the text that should have covered it, not
  to a new line (`SKILL.md`, "Learning").
- There is no size limit. When the files have grown a lot since the last upkeep, a note says so
  at the start of a session; it is a prompt to look, never a block.
- The files under `.claude/skills/` that came with the Keeper, the agents `builder`, `checker`,
  `searcher` and the `keeper-*` hooks are copies from https://github.com/Corvuno/Keeper
  (`.claude/keeper-core.txt` lists them) and are changed there, never here.
