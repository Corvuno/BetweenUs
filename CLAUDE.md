# Working conventions

- Push finished work straight to `main`. Don't open a pull request unless
  explicitly asked to — the user doesn't want to be asked "should I open a
  PR?" each time.
- Once a change is actually decided — the owner approved a specific card, gave a
  correction to fix, or otherwise made the call — make it, commit it, and push it.
  Don't stop to confirm first; that's a separate failure mode from editing without
  permission in the first place, and the owner has said explicitly not to do it.

# Between Us — working rules for this repo

## Card changes require explicit owner sign-off, every time

Never edit, swap, or add a deck card's question text (in `questions/between-us-deck.md`
or in `questions.js`) without the owner's explicit permission for that specific change.
This applies even when the owner has asked in general terms for "more light," "a light
pass," or similar — a general request to improve the deck is not permission to write
specific cards into it.

Instead, when a card change seems warranted, raise it as a proposal and stop — do not
touch the files. For every card you think should change, produce one issue card in
exactly this format:

```
[Category], [number], [current question text]
Reason for change: [why this card should move]
Alternative 1: [candidate replacement question]
Alternative 2: [candidate replacement question]
Alternative 3: [candidate replacement question]
```

One issue card per proposed change, three alternatives each — never pick a single
winner yourself. Only write a swap into the deck files after the owner has replied
picking (or rewriting) one of the alternatives for that specific slot.

**Exception — when the owner names a specific card and says what's wrong with it, that
*is* the sign-off.** "Fix it," or pointing at a card and explaining why it doesn't work
(borrowed from somewhere else, wrong register for the category, whatever), means fix that
card directly and commit — don't turn it back into an issue card with three alternatives.
The issue-card format is for proposals *I'm* raising unprompted; it's not the required
shape for the owner's own corrections. General requests ("add more light") still don't
count as sign-off on any specific card — that distinction is unchanged.

This does not restrict engineering/app-mechanic work (like the Twist modifier layer) —
only the deck's own card content.

## Open, position-inviting questions are not a flaw

Don't cite "reads like a debate" or "asks for a position instead of a story" as a reason to
flag a card. The owner has said explicitly that these are a deliberate, valued card type in
this deck — *"debating is cool, it lets people take a position, a well constructed open
question does more than a thousand specific ones"* — there to break up the monotone feel of
a deck that's otherwise all personal-anecdote prompts. Culture 9 (the art/artist dichotomy)
and Romance 6 (which relationship rule you question) are examples the owner has explicitly
defended on this basis. Judge these cards on the same tests as any other — is it interesting,
is it distinctive, does it duplicate another card — not on whether it invites a position
rather than a story.

## No dating-profile questions

If a candidate card reads like something off a dating-app prompt list ("what's your
warning label," "what's your red flag," "three words that describe you") — a device
borrowed from somewhere else rather than written for this deck — it's disqualified before
any other test runs, regardless of how well it otherwise scores on light/surprising/story.
Screen for this before proposing a card, not after the owner catches it.

## Always cite cards in full

Whenever a card is mentioned for any reason — a proposal, a collision, an example — cite
it as `Category, number, "question text"`, every time, not just category+number and not
just the text. The owner has no lookup table and isn't expected to build one; the full
citation is what makes a reply readable without cross-referencing the deck file.

## Keeping `questions/between-us-deck.md` and `questions.js` in sync

The deck's editorial source (`questions/between-us-deck.md`, with the BENCH and change
log) and the app's actual card data (`questions.js`) have to match exactly — same 34
categories, same 12 cards each, same text, in the same order. Whenever a card changes in
one, change it in the other in the same commit. If there's ever doubt they've drifted,
diff them category by category before touching either.
