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
