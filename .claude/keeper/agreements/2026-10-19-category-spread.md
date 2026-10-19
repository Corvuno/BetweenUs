# At most two cards per category in a hand — agreement, 2026-10-19

Owner's bug: Everything selected, Arc on, a hand of five came out as four Family cards and one
After Dark card. "Not logical." Area: C (how the app works). A and B don't change.

Cause found (tester): nothing spreads categories when a hand is chosen. `_arcHand` (deck.js)
promises "five cards, five categories" but runs after `_sliceDraw` has already cut the hand to
the first N cards, so it can only reorder them. The owner says there were enough unseen
alternatives at the time, so this was not a pass running out.

## What changes
- A hand never holds more than **two cards from one category** while unseen cards from other
  categories are still available. The cap shapes which cards are *chosen*, not just their order.
- **Unseen first stays the law** (owner): the cap only picks among unseen cards. A seen card is
  never brought in to avoid a repeat.
- A third (or more) from one category happens only when the unseen cards leave no other choice,
  e.g. someone picked only one or two categories. That's fine (owner).
- Same rule for Arc and Random, for every hand size (5, 10, 20, All: per run of five cards, at
  most two per category, where the unseen cards allow), and for Three's options.

## What deliberately doesn't change
- The number you pick is the number you get; the "seen" memory; the dials only order, never cut;
  Arc's warm → deep → land order; After Dark never card 1 (5% at card 2); the After Dark weave.

## Done when
- An automatic test reproduces the bug (a varied unseen pool + one category with many unseen
  cards → hands with 3–4 of one category) and fails before the fix, passes after.
- Simulated: with a varied unseen pool, no hand of 5 holds 3+ of one category; with only one or
  two categories selected, hands still fill to the size picked.
- Tester (line by line), reviewer and full test run clean.
