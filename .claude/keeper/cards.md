# Cards — how card work goes

Read before proposing, judging or changing a card, together with `taste.md` (wording the owner
liked and turned down). CLAUDE.md's card rules come first. `panel.md` describes the card panel,
which gives feedback only.

## Proposing a card

- A proposal is plain text in the message, never a code block: a bold line
  `Category, number, "current question text"`, then `Reason for change: …`, then
  `Alternative 1: …`, `Alternative 2: …`, `Alternative 3: …`, each on its own line.
- Three alternatives, no pick. Each is a complete question exactly as it would read on the card,
  at most 95 characters.
- First decide what the card should get out of people and check that almost everyone has an
  answer; then write the question that gets there.
- A card draws a concrete memory, not a theory about oneself. Open, position-inviting cards are a
  separate, wanted type; "reads like a debate" is never a reason to flag a card.
- Borrowed devices are out before any other test: dating-app prompts, "if you ruled the world",
  desert island, superpowers.
- Write to the category's own subject and tone, not a neighbour's (Unwind is the experience and
  the why of leisure, Culture the tangible what; Attract is light and fun).
- The three alternatives differ in substance (a different object, act, person or frame) and
  spread over two or three lines of thought. An owner's example shows tone and form, not the
  subject.
- In every slot at least one alternative is not a question ("Tell about…", "Name…", an open
  sentence, a command). A category never ends a round with fewer such cards than it started with.
- Check every candidate against the whole deck except Colbert, The 36 and Magical (grep its key
  nouns and verbs) and say so; a claim that wasn't checked is marked unverified.
- Screen every card for what it assumes about a player's life: group size (four friends at most
  is common), partner, family, money, children. Roots cards use family stories, things kept,
  grandparents, words and habits from home, never a sharp childhood scene.
- Each card sits within one depth step of its category's `band`; outside it, the card goes or
  the band moves, and the owner decides which.
- After Dark is grown-up questions about sex that start a real conversation, Bare included. Its
  categories split by how far the answer goes and the kind of answer, not by subject.

## The owner's answers

- A "no" to a proposed card, or no answer to it, retires its subject: the next alternatives are
  about something else. "I like the subject, not the question" keeps the subject and gets a new
  question on it. A rejected idea never returns in new words, unless the owner asks for a
  rephrase.
- A comment on one card changes that card only; tone, depth and kind of answer stay as they
  were.
- Silence on a list of cards to change is agreement. A message with no card answers at all means
  not looked at yet.
- A category the owner called good gets no rework proposal without a concrete break.

## Categories and lines

- Every category has an app line and a writer brief in the deck notes (what it is about, the
  subjects a card may cover, where it stops). The brief is built outward from the category's
  purpose, mostly subjects no current card touches.
- Redesigning a category: define it and its borders, then judge its twelve cards as a whole,
  then write cards for the open slots.
- App lines come as three options of different shapes, cover what the cards actually ask, and
  across the app vary in shape and trick. A preset tagline speaks to the people at the table and
  to the cards.

## Changing the deck

- A card change edits `questions.js` and adds a change-log entry in the same commit (slot,
  question number, old text, new text, why, rewording or replacement).
- A rewording keeps the question number; a replacement gets the next free number and the old
  card moves to `RETIRED_CARDS`. Numbers are never reused.
- A displaced card is removed, not benched, unless the owner says "bench it".
- `questions/between-us-deck.md` holds retired category names, the bench, HOUSE STYLE, writer
  briefs and the change log.
- The report cites every changed card in full, old and new.
