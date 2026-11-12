# The Keeper — Between Us

The project's half of the Keeper. The general process is `.claude/skills/keeper/SKILL.md`.

## The areas

**A) The deck**: questions, categories and chapters, as one layered whole. Builder: `deck-builder`.
- Card text lives only in `questions.js`. Categories and chapters are records in the CATEGORIES
  table in `categories.js` (label, colour, band, focus, chapter, bucket …). The bench, HOUSE
  STYLE, retired names, writer briefs and change log are in `questions/between-us-deck.md`.
- CLAUDE.md's card rules apply in full, on the fast path too: the owner approves the exact words
  of every card before it is written.
- Each open card's brief names two or three lines of thought; its three alternatives spread over
  them. Three alternatives on one subject count as one.
- Every category has an app line (short, in the app) and a writer brief in the deck notes (what
  it's about, the subjects a card may cover, where it stops). A category gets both when it is
  reworked, or when it collides as a boundary while writing cards for another category.
- A writer brief's subjects are a direction, not a boundary, built outward from the category's
  purpose, never summarised from its current cards. Most lines of thought must be subjects no
  current card touches; mark the ones that come from existing cards. Many subjects without a
  card is fine.
- Redesigning a category goes in three steps: (1) define it (app line, what it's about, lines of
  thought, where it stops, borders with neighbours named); (2) judge its twelve cards as a whole,
  what stays and what goes; (3) write cards for the open slots.
- After Dark is grown-up questions about sex that start a real conversation, never juvenile or
  drunk sex-talk trivia, Bare included. Screen every After Dark subject and card for this.
- App lines: three options per line, each a different shape (short phrase, image, question,
  contrast), never all "X, Y, Z — and why it matters".
- Card forms vary: questions, open "…" prompts, statements and commands are all fine. In every
  slot at least one alternative uses a non-question form ("Tell about…", "Name…", "Describe…", an
  open sentence to finish, a command). A category never ends a round with fewer non-question
  cards than it started with.
- Depth is per category: every card sits at most one depth step either side of its category's
  `band` (1–7). A card outside it goes, or the band moves; the owner decides which.
- Read `taste.md` before proposing wording; add to it when the owner likes or turns something
  down.
- The card panel (`panel.md`) gives feedback on proposed cards when useful; it never approves
  or writes cards.

**B) Looks**: colours, lines, type, layout, card faces, animation. Builder: `looks-builder`.
- Read `.claude/keeper/references/` before any looks round; each option names the references it
  drew from.
- A topic with no fitting references starts with a mood board the owner reacts to, before any
  sketch. What the owner picks joins the references.
- Way of working: agreement first (what it's for, how it should feel), then how it works in
  words, then a sketch, then the finished look (SKILL.md, "A design round"). Each
  round gets its own new artifact link, shows the current design side by side with the options,
  and says why each option works or doesn't. The builder builds only from the mockup the owner
  chose. `DESIGN-SYSTEM.md` applies.
- Placement, form, size and colour are decided by the Keeper and builders and shown as options.
  The owner is never asked where things go. When an owner's own design instruction is a bad plan,
  say so.
- Hard rules: no glow to draw attention; every question uses one font size, never sized by
  length; chapter and category colours never change without asking the owner, not even a tint;
  layout tests use only the core deck, never Colbert, The 36 or Magical.

**C) How the app works**: behaviour, screens, flows, settings, profiles, saving, offline.
Builder: `app-builder`. Way of working: plain-language options with trade-offs, decided by the
owner.

**Player-facing words**: hints, descriptions and any copy a player reads never use internal
names ("line", "app line", "chapter", "preset", "Arc", "bucket", "band"); they say what happens in
plain words. "Category" is allowed. Check every proposal for this before showing it.

**Names we use**: "The Deck" is the sheet where the evening is set up (code: `#cat-area`); "Selected
deck" on the card screen points to it.

## Agents

- `searcher` (Haiku, read-only): finds whether something was done, agreed or is being worked on,
  in the Keeper notes, the project and its history, and the owner's Claude Code conversations of
  the last two months (further back when the owner asks). Only when the owner asks.
- `checker` (Sonnet, read-only): on medium and large builds, reads the diff and tests the change
  like a player against the acceptance criteria, in one pass; also whenever the owner asks.
- `design-gate` is kept but not used.
- The builders read `.claude/keeper/build-rules.md` and their own agent file.

## How the areas pull on each other

- A new or changed category or chapter (A) changes the selection screens and filters (C) and
  usually needs a colour and a place on screen (B).
- A looks change (B) can change how something works (C), for example moving or hiding a control.
- A chapter change (A) changes what "Draw" plays by default (C, `DEFAULT_SELECTION` in
  `config.js`) and the chapter colours (B).

## Report extras

Every card that changed is cited in full, old and new.

## The backlog

GitHub Issues on this repo: https://github.com/Corvuno/BetweenUs/issues. One issue is one item;
its body is the story, task or decision (SKILL.md step 3). Use the GitHub tools (`list_issues`,
`issue_write`, `add_issue_comment`; search with `gh api -X GET search/issues`).

- **Status** is exactly one label per open issue: `Refine` (needs the owner), `Next` (ready to
  build), `Building now`, `Parked`. Done is closed as completed; dropped is closed as not planned.
- **Order of Next**: `Top` items first, then the rest, each oldest issue number first; `Fill`
  items always last. Nothing else reorders Next.
- **The board** is the owner's GitHub project (columns Backlog, Refinement, Ready, In progress,
  Done). Sessions never touch it; they change labels and open/closed, and
  `.github/workflows/backlog-board.yml` moves the cards. A card the owner drags changes the labels
  within about 15 minutes. The job needs the repo secret `BOARD_TOKEN`; if the board stops moving,
  check that job's runs first.
- **The owner's own items**: an open issue with no status label is the owner's new wish. At
  session start give it a label, keep the owner's words at the top and write the story under
  them. An issue the owner closed is never reopened without asking.
- **The owner's comments**: a comment by the owner gets the label `Owner comment` automatically.
  At session start read every open or recently closed item with that label; the comment counts as
  a chat message. Act on it, answer on the item in one or two plain lines, remove the label. Read
  all comments of an item before building it.
- **Moved from Refinement to Ready by the owner**: check that every question on the item is
  answered, write the answers into the story, criteria and Touches, and name on the item what was
  taken from the comment. The builder gets the item text, never a bare comment. Anything still
  open sends it back to `Refine` with the question.
- **No doubles**: search open and closed issues before creating one; update or comment instead.
- **Building now** gets a comment with the session link when building starts.
- **Commits** name their item, enforced by `.githooks/commit-msg`: `Backlog: #12`, `Fixes #12` in
  the finishing commit, or `No issue: <why>`. A line starting with `#` is a comment and doesn't
  count. Never bypass the lock with `--no-verify`.
- **Clash check exception**: the `?v=` values in `between-us.html` and `RELEASE-NOTES-NEXT.md`
  don't count as shared files; any other change to `between-us.html` does.
- The old backlog file and page are in `.claude/keeper/history/`; never update or republish them.
