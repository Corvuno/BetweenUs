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
  get out of people, then write the question. Each open card's brief names two or three lines of
  thought, and its three alternatives spread over them: three alternatives on one subject count as
  one (owner, 2026-10-29). The owner approves the exact words of every
  card before it is written. No exceptions, including on the fast path.
- Category descriptions (agreed 2026-10-13/14): every category gets two — an app line
  (short, in the app) and a writer brief in `questions/between-us-deck.md` (what it's about,
  the subjects a card may cover, where it stops; the list's order means nothing). A category
  gets this treatment when it is reworked, **and** whenever it is hit as a boundary while
  writing cards for another category and actually collides. Built up as we go, not all at once.
- Subjects in a writer brief are a direction, not a boundary (owner, 2026-10-16): a subject not
  on the list still belongs if it fits "what the category is about". Build the list outward
  from the category's purpose — never by summarising the cards it already has. The subjects
  are thought lines to write cards in — the feeling and the box the writer should look into,
  not a checklist; it's fine that many have no card (owner, 2026-10-18).
- After Dark is never juvenile (owner, 2026-10-18, see vision): grown-up questions about sex
  that start a real conversation — not drunk sex-talk trivia. Screen every After Dark subject
  and card for this, Bare included.
- **Standard method for redesigning a category** (owner, 2026-10-18): (1) define it first — app
  line, what it's about, lines of thought (built outward from its purpose), where it stops, with
  the borders to neighbouring categories named; (2) then look at its twelve cards as a whole: what
  stays and what goes; (3) only then write new cards for the open slots.
- Lines of thought are built outward, not converted from the cards (owner, 2026-10-18: "else this
  exercise is worthless"). Check before showing a list: most lines must be subjects no current
  card touches; mark the ones that come from existing cards.
- Read `.claude/keeper/taste.md` before proposing wording; add to it whenever the owner likes or
  turns something down.
- **Writer test — finished 2026-10-23** (owner confirmed 2026-10-29): writer A 8 picks, writer B 7,
  too close to call, so writer A (the normal method) is the default writer. Not run again unless
  the owner asks. The rule as it was:
  **Writer test (owner, 2026-10-21), for the next batch of card proposals.** Two writers write
  every card in the batch independently, from the same brief: writer A with the normal method
  (CLAUDE.md, HOUSE STYLE, taste.md), writer B with the same method plus the `humanizer` skill,
  using HOUSE STYLE and the current deck as its voice sample. Each writes three alternatives per
  card that pass every card rule. The Keeper screens both sets the same way, then shows the owner
  all six per card in one shuffled, numbered list, with no hint of which writer wrote which. The
  key goes in `.claude/keeper/writer-test-key.md`, which the Keeper doesn't mention or open in
  front of the owner until the owner has picked every card in the batch. Afterwards: count the
  picks per writer, tell the owner the result, record it in lessons.md, and the winner becomes
  the default writer. If six per card turns out too heavy to read, the owner can switch to two
  from each writer.
- App lines: three options per line, and vary the structure — not every line "X, Y, Z — and
  why it matters". Mix short phrases, images, questions, contrasts (owner, 2026-10-18).
- Card forms may vary (owner, 2026-10-15): a question, an open "..." prompt, a statement or a
  command are all fine — variety in how cards ask is welcome.
- **Vary how a card asks — a rule, not a wish** (owner, 2026-10-27: "all questions start with a W
  or H"). In every slot at least one of the alternatives uses another form: "Tell about…",
  "Quote…", "Name…", "Describe…", "Point to…", an open "…" sentence to finish, or a command. A
  round's new cards are not all questions, and a category never ends a round with fewer
  non-question cards than it started with. (The deck is about 80% question words; rounds 1–4
  replaced several open prompts with questions.)
- **Depth stays per category** (owner, 2026-10-26): no per-card depth score. Every card in a
  category sits at most one depth step either side of the category's band (config.js `band`, 1–7),
  so Arc works on categories and nobody notices. Every round checks each card against this; a card
  outside it either goes or the band moves (the owner decides which).
- Builder: `deck-builder`.

**B) Looks** — how anything appears: colours, lines, type, layout, card faces, animation.
- Way of working: agreement first (what it's for, what it should feel like), then rounds of
  real mockups. Every round shows the current design next to the options, each round gets
  its own new artifact link (never overwrite a round the owner has seen), options sit side by side with the current one
  (owner, 2026-10-21), and you explain why
  each option works or doesn't without picking one. The builder builds only from the mockup
  the owner chose. Follows `DESIGN-SYSTEM.md`.
- Placement, form, size and colour are decided by the Keeper and the builder, shown as options. The owner is not asked where things go (owner, 2026-10-16: "I am not a designer"). The Keeper also says so plainly when an owner's own design instruction is a bad plan.
- Hard rules from the owner (2026-10-17):
  - No glowing effects to draw attention.
  - Every question uses the same font size; no sizing by length.
  - Chapter and category colours are never changed without asking the owner first, not even a tint to make one fit.
  - Layout tests use cards from the owner's own deck only, never the optional sets (Colbert, The 36, Magical).
- Builder: `looks-builder`.

**Names we use:** "the evening chooser" = the sheet now headed **The Deck** (named 2026-10-19; was only "What kind of evening?"; code: `#cat-area`). In the app it is The Deck; "Selected deck" on the card screen points to it.

**C) How the app works** — behaviour, screens, flows, settings, profiles, saving, offline.
- Way of working: plain-language options with trade-offs, decided by the owner.
- Builder: `app-builder`.

**Finding things:** when the owner asks whether something has been done, agreed, or is
being worked on in another thread, hand the question to the `searcher` agent (read-only,
on Haiku since 2026-10-21: finding is lookup work, not judgment). It looks in the Keeper notes, the project and its history, and the owner's
Claude Code conversations of the last two months; further back only when the owner asks.
Only on request, never on its own.

**Builder notes:** each builder (and the tester) reads its own corrections file in
`.claude/keeper/builders/` before every job; the Keeper keeps those files up to date.

**Testing:** one generic `tester` for all areas, on Sonnet. It tests the app the way a player
meets it, so cross-area breakage shows up, and checks the agreement line by line. Runs after
every build (owner, 2026-10-19).

**Code review:** the `reviewer` (read-only, on Sonnet) reads the code every build changed:
logic, placement, duplication, current good practice. Runs after every build, next to the
tester. One plain sentence of its verdict goes into the report to the owner.

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

## The backlog page

The owner reads the backlog on phone and PC at https://claude.ai/artifact/67V3Fw68avj2944kjZ71zS
(set up 2026-10-23; a kanban board since the same day: columns Waiting on you, Next, Building
now, Done, Parked; side by side on PC, one per screen on a phone). The page renders `.claude/keeper/backlog.md`, published next to it as
`backlog.md`. After changing `backlog.md`, update the page from any session: read the artifact
once (`action: "read"` with that url), then publish with `url` set to it and
`files: {"backlog.md": ".claude/keeper/backlog.md"}` and no other file, so the page itself stays
as it is. The page's source is kept in `.claude/keeper/backlog-page.html`; change it only when
the owner asks for a different page.
