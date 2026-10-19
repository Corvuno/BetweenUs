# Three goes quiet late in a round — 2026-10-18

Owner reported (PC and Spotlight, 5-card hands): Three switched on mid-hand gives single
cards; it only works after going through the end-of-hand summary. Area: C (how the app
works). A (deck) and B (looks) don't change.

Cause (found by the tester): Three's two extra options come only from cards not yet seen in
the current pass through the selection. Hands and picks use those up; with about 9 or fewer
unseen left, fewer than two extras exist and Three silently falls back to one card. The
summary starts a fresh pass, so Three works again. Seen cards persist across reloads, so a
returning player can be late in a pass from the start; small selections hit it every hand
or two. The fallback came from the 2026-10-15 builder decision "fewer options when the
selection can't supply two extras".

What changes:
1. When fewer than two unseen extras are available, Three tops its options up from cards
   already seen in this pass (never from the current hand, never already offered this
   hand); the sit-out cards from last hand only after that. Three no longer drops to a
   single card because the pass is nearly used up. (Owner OK, 2026-10-18.)
2. Three can be tapped as soon as the first card is on screen (it no longer ignores taps
   for about a second during the first draw animation), main screen and Spotlight.
3. The 3 key switches Three on and off on the main screen too, not only in Spotlight.

What does not change: how picking works, what happens to the two not picked, the summary,
the accepted exceptions (last card waits for next hand; already-played steps after Back
don't re-offer three; dimmed before the first draw), the looks.

The "fewer options" fallback stays only for a selection too small to supply two other
cards at all.

Done when: late in a pass (few unseen left) a 5-card hand with Three on gives three on
every step, on phone, PC and Spotlight; a fresh session still does; items 2 and 3 checked;
`node tests/run.mjs between-us.html` passes with a new check for a late pass.
