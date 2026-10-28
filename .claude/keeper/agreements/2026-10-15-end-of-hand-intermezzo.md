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

## Second round of adjustments (owner, 2026-10-16)

- Fullscreen hint, option C from https://claude.ai/artifact/3nTchXQg531HBofUgPuNRc: a quiet
  line just above the bottom row of fullscreen, in the same words as the phone button —
  "Tap to flip card" on Intermezzo, "Hold to continue" on the list. Built now on today's
  Spotlight layout; the Spotlight-layout thread (L2) is told to carry it over (in L2: just
  above Back · Close · Next).
- The list's questions were far too small to read on phone and PC: make them comfortable to
  read on both (builder sizes it; fewer fit at once, the list scrolls sooner).
- The short message after the last card ("That's your 5 cards.") keeps only its first line,
  centred on the card, then fades out into Intermezzo instead of cutting. The "whole deck"
  version of that message is still open with the owner.

## The message after the last card (owner, 2026-10-16)

Replaces the "whole deck" open point above. The short card shown right after the last card,
before Intermezzo, is centred and then fades out into Intermezzo (no cut). Exact words:

- Normal (unseen cards are left in the selection): one line only —
  "Those were your 5 cards." (5 = this hand's size). No "cards left" count (owner: "it does
  not add"). Grammar for a 1-card hand: "That was your 1 card."
- All cards in the selection drawn: two lines —
  "You've drawn all 312 cards in your selection."
  "Add categories to keep going."
  (312 = the size of the whole selection, not the hand.) No "hold to replay": the button
  already says what to do.

- (owner, 2026-10-16) The message after the last card is far too small: it takes the size of the INTERMEZZO word (in fullscreen: the fullscreen INTERMEZZO word). The list stays as it is.
- (owner, 2026-10-16, replaces the INTERMEZZO-size line above) The message was already bigger than INTERMEZZO; what made it unreadable was the thin slanted serif in faint grey. It takes INTERMEZZO's lettering instead: plain upright spaced capitals in the same bright tone, keeping its current (bigger) size. Same in fullscreen.

## Change and Save get icons and hint lines (owner, 2026-10-18)

Rounds: icons 1 https://claude.ai/artifact/1KVNUfzXVxuDQBGgUwmsrZ (layout D chosen),
2 https://claude.ai/artifact/B2B3knSkV6fCbKny8DrBYn (Save G chosen),
3 https://claude.ai/artifact/AF4fwzCCFMSdr64FxScuRn, 4 https://claude.ai/artifact/XSrzUiqNALxrwtktyEeQW2
(Change L chosen), 5 https://claude.ai/artifact/R1C9kXDzGbLTgCDijtzZjY (L confirmed over knob/radio).

- Change and Save at the end of a hand become full row buttons exactly like Three · Spotlight ·
  Twist on the play screen (layout D): icon + capital label in the same type, fine rules above and
  below the row, an italic hint line under each that disappears once learned, as the others do.
- Change icon L: a deco dial (two arcs, base line, needle ending in a diamond).
  Save icon G: two stacked chevrons over a line.
- Hint lines (owner's words):
  - Change: "set which questions are drawn"
  - Save: "take this morning with you" (05:00–12:00), "take this afternoon with you"
    (12:00–18:00), "take this evening with you" (18:00–24:00), "take tonight with you"
    (00:00–05:00), by the device's local time when the end of the hand is shown.

## From the message into Intermezzo: a slower turn (owner, 2026-10-18)

Compared in https://claude.ai/artifact/4XrDNjNiuMKaLdBJSWUFUV (now / turn / fade). Owner: the turn
works best, but slower ("it looks weird this way"). Keeper decisions, named to the owner:
- The message shows about 1.1 s (one line) or 1.9 s (two lines), then the card turns — no fade.
- The card turns over on its side from the message (front) to the Intermezzo back, swap at the
  edge-on midpoint; then the pause mark draws itself as before.
- Every turn of this card (message → Intermezzo, Intermezzo ↔ list) takes 0.9 s instead of
  0.35 s, with a softer perspective and a slight dip in size at the edge, so it reads as a card
  turning rather than a squash.

## From the message into Intermezzo: the card closes (owner, 2026-10-28)

Owner: two identical turns (message → Intermezzo, Intermezzo → list) read as the same move for different
things. Compared in round 1 (https://claude.ai/artifact/52TCLFktiFP9rrXWrtHejM) and round 2
(https://claude.ai/artifact/8P88KZeC8YzFXyjYa8gXSe). Owner: "It's gonna be 4. That's the best feeling one."
Replaces the 2026-10-18 turn for this one moment.
- Build version "The card closes" exactly as `2026-10-28-end-of-hand-sbs/` version 4 (`closes`, lead .85):
  the message fades; the back's woven lattice grows in from the card's edges and its double frame draws round
  from the top centre (the back's own parts, no new ornament); the finished back holds with an empty window
  (the held empty beat the owner singled out — keep it exactly); then the pause mark draws as before; the
  INTERMEZZO word fades in after the back is up.
- Applies on phone, PC and Spotlight (same Intermezzo everywhere; Keeper's call).
- Unchanged: the message's dwell, the tap flip to the list and back (sideways turn, 0.84s), Back behaviour.
- Reduced motion: a calm fade to a finished Intermezzo.
