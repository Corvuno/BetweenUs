# The Keeper — Between Us

The project's half of the Keeper. The general process is `.claude/skills/keeper/SKILL.md`.

## The areas

**A) The deck**: questions, categories and chapters. Builder: `deck-builder`. All rules are in
`cards.md`; the owner approves the exact words of every card.

**B) Looks**: colours, lines, type, layout, card faces, animation. Builder: `looks-builder`.
- What it should look like: `look.md`, `vision.md`, `taste.md` and the pictures in
  `.claude/keeper/references/`. Named values: `DESIGN-SYSTEM.md`; per screen: `design/`.
- Placement, form, size and colour are yours to decide and show; the owner is never asked where
  things go. The builder builds only from the design the owner chose.

**C) How the app works**: behaviour, screens, flows, settings, profiles, saving, offline.
Builder: `app-builder`. Plain-language options with trade-offs, decided by the owner.

**How they pull on each other**: a new or changed category or chapter (A) changes the selection
screens (C), what "Draw" plays by default (`DEFAULT_SELECTION` in `config.js`) and needs a
colour and a place (B). A looks change (B) can move or hide a control (C).

## Agents

- `checker` (Sonnet, read-only): on medium and large builds, reads the diff and tests the change
  like a player against the acceptance criteria; also whenever the owner asks.
- `searcher` (Haiku, read-only): finds whether something was done, agreed or is being worked on.
  Only when the owner asks.
- The builders read `build-rules.md` and their own agent file.

## The backlog

GitHub Issues: https://github.com/Corvuno/BetweenUs/issues. One issue is one item. Use the
GitHub tools; search with `gh api -X GET search/issues` (the query needs `is:issue`).

- **Status** is exactly one label per open issue: `Refine`, `Next`, `Building now`, `Parked`.
  Done is closed as completed; dropped is closed as not planned.
- **Order of Next**: `Top` items first, then oldest number first; `Fill` items last.
- **The board** is the owner's GitHub project. Sessions never touch it: they change labels and
  open or closed, and `.github/workflows/backlog-board.yml` moves the cards within about fifteen
  minutes (it needs the repo secret `BOARD_TOKEN`).
- **The owner's own items**: an open issue with no status label is a new wish. Give it a label,
  keep the owner's words at the top and write the story under them. An issue the owner closed is
  never reopened without asking.
- **The owner's comments** get the label `Owner comment` automatically. Read each as a chat
  message, act on it, answer on the item in a line or two, remove the label. Read all comments
  of an item before building it.
- **Moved to Ready by the owner**: write the answers from the comments into the story, criteria
  and Touches; anything still open sends it back to `Refine` with the question.
- **Commits** name their item (`.githooks/commit-msg`); never bypass the lock with
  `--no-verify`.
