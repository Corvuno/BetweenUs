# Three becomes one card — 2026-10-15

Owner's wish: the Three screen (pick one of three, normal screen) is "too much" — three
boxed, shadowed, stepped cards. It should be one card split three ways, taking the card
from an earlier mockup and the category lines from Full screen, without the numbers (no
hierarchy between the three). Area: B (looks). A (deck) and C (how picking works) don't
change.

Round 1: https://claude.ai/artifact/BCxyHQUfp5BTPyGNgFeMMc — owner chose option C.
Exact CSS of the chosen option: the mockup's option-C.css (copied into the builder brief).

What changes (normal screen, phone and desktop):
- The three separate cards become one card, on the drawn card's own surface, frame
  strength and gold corner marks (once, top-left and bottom-right of the whole card).
- Three equal parts, separated by a thin plain line. No diamond, no numbers, no left column.
- Each part: category name in its colour above the question, both left-aligned; in front
  of them the category-coloured line exactly as Full screen's Three draws it.
- A small arrow in the category colour at the right edge of each part, dim at rest,
  brighter on hover/press.
- Gone: per-card frames, shadows, corner marks, coloured top bars, the stepped layout.

What does not change: Full screen's own Three screen; how picking works (tap a question to
keep it); everything around the card; the questions.

Done when: phone and desktop screenshots of the real app match round 1 option C; a
three-line question still fits; tests pass.

Decided after the build (2026-10-15): questions stay in the app's Bodoni, like the card and
Full screen. The round-1 pictures showed Cormorant only because the mockup CSS overrode it.
