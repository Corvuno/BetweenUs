# Hand size, dials, Arc, and the missing category title — 2026-10-14

Owner's bug report: picking 5 drew 4/3/1 and sometimes 5; picking All drew 7, then 4,
then something else; the category title vanished from the card "when mucking about with
Twist and fullscreen". Agreed in the session of 2026-10-14. Area: C (how the app works).
A (deck) and B (looks) don't change.

## Bug 1 — the number you pick is the number you get

Cause found: with the Depth/Focus dials moved, each hand was drawn from a random ~30% slice
of the selection, and only the unseen cards inside that slice could be drawn. The "seen"
memory persists across days, so for a regular player the slice often held only a few
unseen cards → short hands; All gave "every unseen card in the slice" (7, 4, 40, …).

What changes:
- The dials no longer cut cards away. Every unseen card in the selection stays in play.
  Cards that suit the dials tend to come earlier, mixed with the others (not absolute),
  fading gradually to the normal mix as they run out.
- 5 / 10 / 20 = that many cards, taken from the unseen cards in that order. Fewer only when
  fewer unseen cards are left in the selection.
- All = every unseen card in the selection, in one hand, ending on the end screen.
- Shuffle decides the order inside the hand. Arc plays arcs of 5 cards (warm → deep → land),
  one after another, also inside a 10, 20 or All hand ("mini arcs"). The dials decide which
  cards fill the early arcs. Random keeps a random order.
- When no unseen cards are left: the end screen, and continuing from it starts over with
  every card in the selection (without wiping the history list the player can see).

What does not change: the categories, presets, the end screen's looks, Three, Twist,
Spotlight, the After Dark opener rule (never the very first card).

## Bug 2 — the category title vanishes

Cause found (reproduced every time by a Sonnet tester): after a settings change, opening
Spotlight before pressing Draw and closing it shows card 1 on the main card with its
category title fully transparent. Twist was not involved.

Fix: a card shown that way gets its category title like any other drawn card. Same for
the other routes that show a card without the flip (reopening a saved session, going back
from the end screen).

## Done when

- With most of the deck seen and the dials moved, 5 gives 5 every hand until fewer than 5
  unseen cards are left; All gives every unseen card in the selection.
- Arc hands of 10/20/All read as consecutive arcs of 5.
- No unseen cards left → end screen → continuing starts a fresh pass.
- Spotlight-before-Draw, saved-session reopen and back-from-end-screen all show the title.
- `node tests/run.mjs between-us.html` passes.
