# Between Us — project rules

This file says how the project works now. One statement per rule. No dates, no history, no
stories: git keeps the history.

## The Keeper

- Every session is the Keeper: follow `.claude/skills/keeper/SKILL.md` from the first message,
  with or without `/keeper`.
- A session that runs unattended (the scheduled Friday clean-up) follows the Keeper's rules for
  building, checks, the backlog and the report, and never waits for the owner: anything that
  needs a decision goes on the backlog labelled `Refine`.

## Working with the owner

- The owner never touches code: no diffs to review, no commands to run, no branch or pull
  request to merge. Build it, verify it works (run it, screenshot it), land it on `main`.
- Finished work is pushed to `main`. No pull request unless the owner asks for one. A session
  told to develop on a feature branch finishes there, then merges it into `main` and pushes
  `main` in the same session.
- Say before or while building when something seems off, redundant, or in tension with an
  earlier decision. Volunteer opinions and alternatives. Now and then ask whether the overall
  direction is working.
- Design decisions (interface, deck structure, anything that is a judgement call) are shown as
  options with the reasoning behind each, and wait for the owner's call. Clear bug fixes and
  changes the owner already decided are built without asking.
- For every set of options: say why each works or doesn't and how each compares to the current
  state. The Keeper may name the option it would take, with its reason. Card text never gets a
  pick.
- Whenever you show alternatives, options or a redo, show the current version in full right
  above them, plus the owner's named direction if there is one.
- Ask in plain sentences in the message. Never use the `AskUserQuestion` tool. Number the
  questions when there is more than one. No suggested answers, no reply templates, no telling
  the owner what to type.
- Never a bare number or code: a backlog item is its number and its title, a commit is what it
  did, a card is cited in full.
- Say what happened: when something is blocked, fails, is retried or turns out different from
  expected, say what was tried, what happened, and what was and wasn't changed.
- Never overwrite what the owner has seen. A new round of mockups or options gets its own new
  artifact link and file. Text the owner has seen is removed only when they ask for that change,
  and the message says what was removed. Anything overwritten by mistake is put back as its own
  link or file in the same turn. A page is updated in place only when the owner asked for that
  page to change.
- Subagents may be used whenever they make the work cheaper or faster. Brief each one fully.
  Never run two agents that edit the same files at once.

## Backlog and building

- The backlog is GitHub Issues (`.claude/keeper/project.md`, "The backlog"). Search open and
  closed issues before adding one.
- Every commit names its issue (`Backlog: #12`); the commit that finishes it says `Fixes #12`;
  a commit that fits no issue says `No issue: <why>`. The commit lock enforces this.
- A decided change goes at the bottom of the backlog, or the top when the owner says so; never
  ask where. When its turn comes it is built and pushed without confirming again.
- A build lands on `main` as soon as its checks pass. Never ask the owner when to push.
- One build per file at a time: build only items taken from Next, take related Next items
  along, never start an item that shares a file with one in Building now, at most three builds
  at once. Scheduled jobs (label `Fill`) only fill free room. Details: SKILL.md, "The backlog".
- Before a large or structural change (many files, or a shared file such as `config.js`), fetch
  `origin/main` and skim the recent commits. If another session is working in the same area,
  say so before starting. A merge conflict with another session's work is reported to the owner.

## Frozen legacy versions

- `between-us-classic.html` and `between-us-first.html` never change, except for a security
  problem, a fault that breaks the page or loses data, or the owner asking for that specific
  change. "All versions" means main, dev and work. Work on shared files never reaches these two.

## Commit labels and release notes

- Every commit that touches the app or the deck ends, above the Co-Authored-By lines, with:
  `Change: small | medium | large` and `Note: <one plain line for players>`.
- small: a fix, a tweak, a card or two (patch bump). medium: a new or reworked feature or screen
  (minor bump). large: changes how the app works overall or breaks old behaviour (major bump).
  Three or more cards changed in one release count as medium automatically.
- The Note says what changed for a player, not how ("Fixed the Fullscreen button overlapping the
  card", not "adjust z-index").
- Commits touching only docs, `questions/` notes, tests, `.github/` or `.claude/` need no label.
- Version numbers, tags and release notes are never edited by hand. The release workflow
  (`.github/workflows/auto-release.yml`, rules in `scripts/release-plan.mjs`) cuts a release
  every three nights, Amsterdam time. Preview: `node scripts/release-plan.mjs --force`.
- Every user-facing commit also updates `RELEASE-NOTES-NEXT.md` by the rules in its header:
  merge into an existing bullet when it belongs there; a new bullet only for something a player
  notices as new; small things under the final "smaller fixes" bullet; at most about five
  bullets; no headings; nothing about colours, fonts, sizes or positions; no card text; card
  changes are one bullet with counts.

## Cards

- Card text in `questions.js` is never edited, swapped or added without the owner approving
  those exact words for that slot. A general request ("more light") is not permission. The
  owner naming a bad card is permission to remove it, not to choose its replacement. This does
  not restrict work on app mechanics.
- A card change is proposed as an issue card, written as plain text in the message (never in a
  code block):
  a bold line `Category, number, "current question text"`,
  then `Reason for change: …`,
  then `Alternative 1: …`, `Alternative 2: …`, `Alternative 3: …`, each on its own line.
- Every proposal has three alternatives and no pick. Each alternative is a complete, finished
  question exactly as it would read on the card.
- Before writing an alternative, decide what the card should get out of people and check that
  almost everyone has an answer to it; then write the question that gets there.
- A card draws a concrete memory, not a theory about oneself. If the likely answer is a
  definition or a philosophy, the card fails (open position cards are a separate, wanted type).
- Write to a category's real subject, not a neighbour's: Unwind is the experience and the why
  of leisure; Culture is the tangible what.
- After a rejection, change the subject or the angle, never just the wording.
- The three alternatives differ in substance: a different object, act, person or frame does the
  work. A rejected idea doesn't come back in new words. The exception: the owner asks for the
  same question rephrased.
- Every candidate is checked against the whole deck (grep its key nouns and verbs) before it is
  proposed or called distinct. A claim that wasn't checked is marked unverified.
- Open, position-inviting questions are a valued card type. "Reads like a debate" is never a
  reason to flag a card.
- Borrowed devices are disqualified before any other test: dating-app prompts ("your red flag",
  "three words that describe you"), "if you ruled the world", desert island, superpowers.
- Every card mentioned is cited as **Category, number, "question text"**, on its own line, the
  citation alone and in bold. A comment goes on the next line, starts with "Comment:" and is not
  bold. Proposed wording is laid out the same way. A group of cards is never mentioned without
  every card in it shown in full.
- Card text lives only in `questions.js` (34 categories, 12 cards each). Categories and chapters
  live in `categories.js`. `questions/between-us-deck.md` holds the archive of retired category
  names, the bench, HOUSE STYLE and the change log.
- A card change edits `questions.js` and adds a change-log entry (old text, new text, why) in
  the same commit.
- A displaced card is removed, not benched, unless the owner says "bench it".

## Looks

- Chrome and visual work uses the tokens in `DESIGN-SYSTEM.md` instead of one-off values.
  Category, chapter and mode colours are content colour and stay outside it. Read its section on
  the font-size scale before extending that scale.

## Rule files stay lean

- Rule files say how things work now: one statement per rule, no dates, no "the owner said on…",
  no "until X the rule was", no stories of past mistakes. When a rule changes, its line is
  replaced, not added to.
- Rule files: this file, `.claude/skills/keeper/SKILL.md`, `.claude/keeper/*.md`,
  `.claude/agents/*.md`, `.claude/hooks/*.sh`. Records (agreements, decided-files, old backlog,
  test keys) live in `.claude/keeper/agreements/` or `.claude/keeper/history/`, which no session
  reads at start.
- `node scripts/check-rules.mjs` fails on a date or a history marker in a rule file, or a file
  over its size budget. The commit lock and GitHub run it. A budget is raised only when the owner
  agrees.
