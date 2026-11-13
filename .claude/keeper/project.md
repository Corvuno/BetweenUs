# The Keeper — Between Us

What is particular to this product. What the Keeper is and how it works is generic and lives in
`.claude/skills/keeper/`.

## The areas

**A) The deck**: questions, categories and chapters. The owner approves the exact words of every
card. Notes: `cards.md`, `taste.md`; `panel.md` for the card panel.

**B) Looks**: colours, lines, type, layout, card faces, animation. Notes: `look.md`, `taste.md`,
the pictures in `.claude/keeper/references/`, `DESIGN-SYSTEM.md` for the named values and the
file in `design/` for the screen being changed. Placement, form, size and colour are yours to
decide and show; the builder builds only from the design the owner chose.

**C) How the app works**: behaviour, screens, flows, settings, profiles, saving, offline. Options
in plain language with what each costs; the owner decides.

They pull on each other: a new or changed category or chapter (A) changes the selection screens
(C) and what "Draw" plays by default, and needs a colour and a place (B). A looks change (B) can
move or hide a control (C).

## What else to read, and when

- Any design or wording work: `look.md`, `taste.md`, and `vision.md` ("The screen, on every
  device").
- Any card work: `cards.md` and `taste.md`.
- Any build: `build-rules.md`, which has a part for each area, and `CHECKS.md`.
- What the owner already settled about a part of the app: its file in `design/`, and its
  `decided.md` and agreements in `.claude/keeper/agreements/`. Older mockups are on the branch
  `archive/keeper-mockups`.

## The backlog

GitHub Issues: https://github.com/Corvuno/BetweenUs/issues. One issue is one item. Use the
GitHub tools; search with `gh api -X GET search/issues` (the query needs `is:issue`).

- **Status** is one label per open issue: `Refine`, `Next`, `Building now`, `Parked`. Done is
  closed as completed; dropped is closed as not planned.
- **Order of Next**: `Top` items first, then oldest number first; `Fill` items (scheduled jobs)
  last, and only when there is free room.
- **The board** is the owner's GitHub project. Sessions never touch it: they change labels and
  open or closed, and `.github/workflows/backlog-board.yml` moves the cards within about fifteen
  minutes (it needs the repo secret `BOARD_TOKEN`).
- **The owner's own items**: an open issue with no status label is a new wish. Give it a label,
  keep the owner's words at the top and write your take and what is open under them. An issue
  the owner closed is never reopened without asking.
- **The owner's comments** get the label `Owner comment` automatically. Read each as a chat
  message, act on it, answer on the item in a line or two, remove the label.
- **Moved to Ready by the owner**: write the answers from the comments into the item; anything
  still open sends it back to `Refine` with the question.
- **Commits** name their item: `Backlog: #12`, `Fixes #12` in the commit that finishes it, or
  `No issue: <why>` (`.githooks/commit-msg`; never `--no-verify`). The `?v=` values and the
  release-notes file don't count as shared files between builds.
