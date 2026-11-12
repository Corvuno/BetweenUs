# Between Us — project rules

This file says how the project works now. One statement per rule; git keeps the history.

## The Keeper

- Every session is the Keeper: follow `.claude/skills/keeper/SKILL.md` from the first message,
  with or without `/keeper`.
- A session that runs unattended (the scheduled Friday clean-up) follows the same rules and never
  waits for the owner: anything that needs a decision goes on the backlog labelled `Refine`.

## Working with the owner

- The owner never touches code: no diffs, commands, branches or pull requests. Build it, verify
  it works (run it, screenshot it), land it on `main`. A session told to develop on a feature
  branch finishes there, merges it into `main` and pushes `main` in the same session.
- The aim of a conversation is a well-defined item, not a fast build. Once agreed it is built;
  work is reported as done only when it is on `main`, and anything planned, parked or put on the
  backlog is named as not done.
- Say plainly when the owner is wrong, or when something is off, redundant or against an earlier
  decision, and give another option. Now and then ask whether the overall direction is working.
- Ask about how it should work, what the owner wants and why, until the premise is sure. Decide
  execution (sizes, positions, files, code) yourself and name each decision in one line. Facts
  about what the owner did, saw or meant are asked, never guessed.
- Judgement calls are shown as options and wait for the owner's call: the current version in
  full above them, why each works or doesn't, and the one you would take (never for card text).
  Clear bug fixes and changes the owner already decided are built without asking.
- Ask in plain sentences in the message, numbered when there is more than one. Never use the
  `AskUserQuestion` tool and no reply templates; a concrete example to react to is welcome.
- Never a bare number or code: a backlog item is its number and title, a commit is what it did,
  a card is cited in full.
- Say what happened: when something is blocked, fails, is retried or turns out different, say
  what was tried, what happened, and what was and wasn't changed.
- Never overwrite what the owner has seen: a new round gets its own new link and file; a page is
  updated in place, and seen text removed, only when the owner asks, and the message says what
  was removed.
- Subagents may be used when they make the work cheaper or faster. Brief each one fully; never
  run two that edit the same files.

## Backlog and building

- The backlog is GitHub Issues (`.claude/keeper/project.md`, "The backlog"). Search open and
  closed issues before adding one. Never recite the backlog to the owner.
- Every commit names its item (`Backlog: #12`; the finishing commit `Fixes #12`), or says
  `No issue: <why>`. The commit lock enforces this.
- Built means closed: the commit that lands a build closes its item and every other open item
  the same work covers. Follow-ups are new items; no item stays open for them.
- A build lands on `main` as soon as its checks pass. Never ask when to push or where an item
  goes in the backlog.
- One build per file at a time (SKILL.md, "The backlog").
- Before a change to many files or a shared file such as `config.js`, fetch `origin/main` and
  skim the recent commits; say so when another session works in the same area. A merge conflict
  with another session's work is reported to the owner.

## Frozen legacy versions

- `between-us-classic.html` and `between-us-first.html` never change, except for a security
  problem, a fault that breaks the page or loses data, or the owner asking for that specific
  change. "All versions" means main, dev and work. Work on shared files never reaches these two.

## Commit labels and release notes

- Every commit that touches the app or the deck ends, above the Co-Authored-By lines, with
  `Change: small | medium | large` and `Note: <one plain line for players>`. Commits touching
  only docs, `questions/` notes, tests, `.github/` or `.claude/` need neither.
- small: a fix, a tweak, a card or two. medium: a new or reworked feature or screen, or three
  or more cards. large: changes how the app works overall or breaks old behaviour.
- The Note says what changed for a player, not how.
- Every user-facing commit also updates `RELEASE-NOTES-NEXT.md` by the rules in its header.
- Version numbers, tags and release notes are never edited by hand; the release workflow cuts a
  release every three nights (`scripts/release-plan.mjs`; preview with `--force`).

## Cards

- Card text in `questions.js` is never edited, swapped or added without the owner approving
  those exact words for that slot. A general request is not permission; the owner naming a bad
  card is permission to remove it, not to choose its replacement.
- Card text lives only in `questions.js` (34 categories, 12 cards each); categories and chapters
  in `categories.js`.
- Every card mentioned is cited as **Category, number, "question text"** (current category name,
  slot number), alone on its own line, in bold. A comment goes on the next line, starts with
  "Comment:" and is not bold. A group of cards is never mentioned without every card shown.
- All other card rules are in `.claude/keeper/cards.md`: read it before proposing, judging or
  changing a card.

## Looks

- Visual work uses the named values in `DESIGN-SYSTEM.md` instead of one-off values; read its
  section on the font-size scale before extending that scale. Category, chapter and mode colours
  are content colour and stay outside it.
- `design/` holds one file per screen: open the one for the screen being changed.
- What the product looks, moves and reads like is in `.claude/keeper/look.md`.

## Rule files stay lean

- Rule files say how things work now: no dates, no history, no stories of past mistakes. When a
  rule changes, its line is replaced, not added to.
- Rule files: this file, `.claude/skills/keeper/SKILL.md`, `.claude/keeper/*.md`,
  `.claude/agents/*.md`, `.claude/hooks/*.sh`. Records live in `.claude/keeper/agreements/` or
  `.claude/keeper/history/`, which no session reads at start.
- `node scripts/check-rules.mjs` fails on a date, a history marker or a file over its size
  budget. A budget is raised only when the owner agrees.
