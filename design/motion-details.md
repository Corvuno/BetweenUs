# Motion details by screen

Curves and general motion rules are in `DESIGN-SYSTEM.md`. The card's moments (draw, change, turn)
are the game, not menu chrome, so they are slower and fuller than the menu. Menu and every sliding
panel are slow; curves are fixed, only durations and delays vary.

## First draw of a hand
One 1300ms landing (`cardDrawIn`, single keyframe segment on `--ease-out`, no bounce). Two ghosts
ease-out, 1300ms, delays 0 and 150ms. The start-back dissolve starts at 150ms and takes 550ms
(gone before the question). The question swaps in at 775ms and clean-up is at 1450ms (`card.js`
`DRAW_TIMING`), so the question's fade overlaps the landing. The accent bloom stays. Reduced
motion: no drop, no ghosts, a 250ms opacity fade, swap at 150ms.

## Next/Back swap on the card
`card.js` `playSwapOut` / `playSwapIn`; Web Animations, transform and opacity only, no glow.
- **Out, 110ms:** the rail flares lighter from the centre (`.c-lift`, a child of `.c-accent` so it
  takes the phone rail's and the PC top line's height and faded ends; opacity 0 to 1, `scaleX` .5
  to 1); the card tightens to .992; the corner marks lift to .6; label and question fade out with
  a lift of 2/178 of the card's width (80ms after a 30ms delay, ease-in `cubic-bezier(.4,0,1,1)`).
  The text changes while invisible.
- **In, 230ms:** flare, card and corners settle back; the new label (delay 20ms) and question
  (delay 40ms) rise from 8/178 of the card's width below over 190ms; ease-out
  `cubic-bezier(.16,1,.3,1)`.
- Lift and rise are shares of the card's width (`TEXT_LIFT_SHARE`, `TEXT_RISE_SHARE`, measured on
  the 178px card of the chosen preview), so they read the same on a 354px phone card and a 1062px
  PC card; the frame's tighten (.992) is already a ratio. The rail and flare keep their weight (a
  stroke, not a distance).
- Frame only: the question is never scaled, because the text block carries the exact inverse of the
  card's scale. The rail's colour still eases to the new category (the `--rail-*` transition).
- The flare is the rail's gilt light stop (`--rail-l`) mixed 45% toward white
  (`color-mix(in oklab,var(--rail-l) 45%,#fff)`), peak .95, thickness equal to the rail, no glow.
- Next, Back and a card chosen in Three all use this swap. The 1s `accent-bloom` replay is not part
  of it; the bloom stays on the first draw of a hand (card.js first-draw face swap), the Intermezzo
  turn and the Spotlight/presentation face changes (presentation.js).
- Reduced motion: 80ms linear fade out, 120ms in, no movement. A fast tap during the out beat just
  retargets it; during the in beat it restarts the swap.

## The turn
Intermezzo to the hand list, and back: 840ms, edge-on and face swap at 420ms (`TURN_MID_MS` /
`TURN_END_MS` in `deck.js` follow the CSS). Details: `end-of-hand.md`.

## Drawers, sub-drawer, The Deck sheet, scrims
Open 640ms on `--ease-sheet`, close 420ms; the base selector carries the close timing, `.open` the
open timing. Desktop modals: open 560ms `--ease-out`, close 400ms ease-out, opacity 400ms. The
scrim follows the sheet (420ms / 640ms).

## Fold-outs
Chapter panels open 260ms / close 200ms on `--ease-out` (`ui.js` `slideFold`); a chapter hiding
under a preset the same pair. (`.tray` and the Start-from preset host carry the same pair but do
not animate today: no `.tray` element exists and the preset host is always open.)

## Entrance
Header, card, controls, party overlay, party chrome and the token hint use `--ease-out` at about
340-380ms; the stagger (header 100ms, card 50ms, controls 200ms) stays.

## Buttons
Draw's gold (`--bd-a/--bd-b`) moves in .2s like the rest of the button; only the end-of-hand colour
(`.hold-mode`) eases in .6s.
