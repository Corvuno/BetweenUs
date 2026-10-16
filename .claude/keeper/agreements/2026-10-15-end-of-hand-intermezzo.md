# End of hand: Intermezzo — 2026-10-15

Owner's wish: the end screen has been a quarrel for months. Settled in the session of
2026-10-14/15 over two mockup rounds:
round 1 https://claude.ai/artifact/1DZggSZggbGkfcubGsFHES,
round 2 https://claude.ai/artifact/DQX7jeiYQ3tnDgPhQeJUPE.
Chosen: round 2 "1 B · with a caption" combined with "1 B · motion", flipping to
"Plan 3" (the hand list). Areas: B (looks) and C (how the app works). A (deck) unchanged.

The end screen's job (owner): a pause first and foremost, a stop at the end of a hand.
No depth/arc information for the player, no "cards left" count, not ornamental, explain
nothing that a button or subtle nudge can carry.

Mockup files (stills and motion, made inside the real app by injecting DOM/CSS) are in
`2026-10-15-intermezzo-mockup/`: `r2-b1.png` (Intermezzo side), `r2-h5.png` and
`r2-h20s.png` (list side, 5 and 20 cards), `b3.mp4` (the motion), `mockup-script.mjs`
(the exact SVG/CSS used in the mockups — FERMATA, FERM_CSS, handList()).

## B) Looks

- End of every hand: the card fades to its lattice back (the existing `.card-back`). In the
  window: the pause mark (fermata: two hairline arches over a diamond, flanking hairlines)
  with "INTERMEZZO" in small spaced capitals under it. Diamond and the small rule under the
  mark take the colour of the **last drawn card's chapter**.
- Motion, every hand: card fades to its back → arches draw in one after the other → diamond
  appears → diamond keeps breathing.
- Flip: the card turns over on its side (3D, like a real card) to the hand list: each
  question with a small diamond in its category colour and its own star (outline = not
  starred, gold = starred). The list scrolls inside the card, thin gold scroll bar, lines
  fade at top/bottom edges. No title on that side; the card's corner star is hidden there.
- Main button at the end of a hand: in the last drawn card's chapter colour (replaces the
  fixed brown `.hold-mode`).
- Change and Save: same colour as the Three / Spotlight / Twist labels once a card is drawn.
- The logo on the card back (start screen, "A place to begin…"): draws itself, then its
  diamond breathes — every time that back appears (app open, after a settings change).
- Fullscreen: same mark, word, list, flip and animation, in fullscreen's own layout.
- Reduced motion (OS setting): everything still, no drawing or breathing; the flip is a
  plain switch.

## C) How it works

- Button at the end of a hand: "Hold to flip card". Holding the button **or the card**
  flips to the list. Then the button says "Hold to continue"; holding starts the next hand.
- Back on the list side (← button, swipe right, left arrow key — all `prevCard()` today):
  turns the card back to Intermezzo. On the Intermezzo side back works as it does now.
- Stars in the list: tapping stars/unstars that question — the same favourites as the star
  on a normal card.
- Save: one press downloads two files: the questions list (as now) and a new state file
  (selection, settings, where you are). Import in the log drawer opens either; a state file
  restores the state.
- Fullscreen: the same flow.

## Goes away

"The set is finished", the "You began at… and ended…" sentence, the category tags, the
"one card you starred" line, the brown Hold button.

## Doesn't change

Drawing, hand size, Three, Spotlight, Twist, the header, the chapter colours.

## How the areas affect each other

The last drawn card (C) sets the colour of the button, the diamond and the small rule (B).

## Done when

- Every hand ends on Intermezzo with the animation, phone and fullscreen.
- Hold flips to the list; hold again continues. Back returns to Intermezzo.
- Stars in the list save as favourites.
- Save gives two files; the state file loads back in through Import.
- The start logo animates every time the card back appears.
- `node tests/run.mjs between-us.html` passes.

## Added during the build (owner, 2026-10-15)

- Back from the list to Intermezzo: the mark does not redraw; it shows finished, diamond breathing.
- Fullscreen: the "— end —" text in the count slot at the end of a hand goes.
- The old fullscreen end-of-hand summary ("Arc complete", small arc chart) is removed with the rest of the old end screen.

## Adjustments after the first build (owner, 2026-10-16)

- Intermezzo flips with a **tap**, not a hold: button reads "Tap to flip card"; a tap on the
  button or the card flips to the list. "Different world, different behaviour."
- A **hold** on Intermezzo skips the list and goes straight to the next hand.
- List side unchanged: "Hold to continue" stays a hold; taps on the list stay free for
  scrolling and stars (a tap on the list does not flip back; only Back does).
- The start-card logo animation, when a new deck loads from the deck configuration sheet
  (the categories sheet), waits until the sheet has fully closed before it plays.
- Fullscreen: the two short lines next to the empty count slot stay hidden.
