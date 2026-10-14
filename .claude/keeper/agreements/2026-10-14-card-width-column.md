# The card is the widest thing on the main screen — 2026-10-14

Owner's report: the progress line under the card should span the full width "so it's an
infinite line illusion"; it doesn't, and looks worse on PC. The bottom controls (Next Card
and others) can be wider than the card on PC. "The card should be the max width for all
elements" — including the logo and the "Selected" line above the card. Area: B (looks).
Nothing in A or C changes.

Cause found (Sonnet tester): the progress line is fixed at 300px (styles.css ~380,
presentation.js renderProgress `W = 300`), under a ~376px card on a phone and ~735px on a
1440px desktop; for hands over 20 cards it shows a growing/sliding window of up to 20
pieces that never reaches the edges and never fades; the end diamond only shows when the
last card is in view.

What changes:
- The progress line is always exactly the card's width, on phone and desktop.
- 5 / 10 / 20 cards: the pieces share that width edge to edge, diamond at the end.
- More than 20 cards: the pieces still fill the card's width, and fade out at the left and
  right edge so the line reads as carrying on beyond the card; the diamond appears once
  the last card is inside the visible stretch.
- Nothing on the main screen is wider than the card: logo + its line work, the "Selected"
  line, the counter, the Next Card row (back, Next Card, menu), the Three / Spotlight /
  Twist row and the lines around it. On screens where they already fit, nothing moves.

What does not change: colours, type, the card itself and its size, the pieces' colours per
category, the Spotlight (fullscreen) view, the chooser sheet.

Done when: phone (412 wide) and desktop (1440 wide) screenshots show every element on the
main screen within the card's left and right edges, and the line edge to edge under the
card for 5, 20 and All hands (with the fade on All).
