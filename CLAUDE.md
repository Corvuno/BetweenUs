# Between Us — working rules for this repo

## Card changes require explicit owner sign-off, every time

Never edit, swap, or add a deck card's question text (in `questions/between-us-deck.md`
or in the `NEWDECK_CARDS`/other card arrays inside `between-us*.html`) without the
owner's explicit permission for that specific change. This applies even when the owner
has asked in general terms for "more light," "a light pass," or similar — a general
request to improve the deck is not permission to write specific cards into it.

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

This does not restrict engineering/app-mechanic work (like the Twist modifier layer) —
only the deck's own card content.

**Exception — when the owner names a specific card and says what's wrong with it, that
*is* the sign-off.** "Fix it," or pointing at a card and explaining why it doesn't work
(borrowed from somewhere else, wrong register for the category, whatever), means fix that
card directly and commit — don't turn it back into an issue card with three alternatives.
The issue-card format is for proposals *I'm* raising unprompted; it's not the required
shape for the owner's own corrections. General requests ("add more light") still don't
count as sign-off on any specific card — that distinction is unchanged.

## Commit and push without asking

Once a change is actually decided — the owner approved a specific card, gave a correction
to fix, or otherwise made the call — make it, commit it, and push it. Don't stop to confirm
first; that's a separate failure mode from editing without permission in the first place,
and the owner has said explicitly not to do it. Asking "should I commit this?" after the
decision has already been made just adds a round trip for no reason.

## Always cite cards in full

Whenever a card is mentioned for any reason — a proposal, a collision, an example — cite
it as `Category, number, "question text"`, every time, not just category+number and not
just the text. The owner has no lookup table and isn't expected to build one; the full
citation is what makes a reply readable without cross-referencing the deck file.
