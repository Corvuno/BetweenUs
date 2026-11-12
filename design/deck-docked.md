# The Deck, docked on a computer

On a wide window with a mouse (min-width 1280px, min-height 560px, aspect 5/4 or wider, hover and
fine pointer) The Deck is a panel docked to the left edge (under Selected deck, which opens it),
beside the card, instead of a window over it. It must not look like a phone sheet on a PC.
1280px is the width where the header (Selected line, logo, Spotlight / Menu) still has its room
with the panel open: the card is then 604px, the same as docked at 1280x720; narrower, the header
would collide. Below that, or touch only, the phone sheet and the centred window are as before.
The condition is written twice in `styles.css` (once excluding the centred window, once for the
dock) and once in `ui.js` (`dockedQuery`); `syncDock()` applies it on open and when the window is
resized while the panel is open.

- **Panel** (`.cat-area` in the dock block, "THE DECK, DOCKED"): `--dock-w`
  (`clamp(560px,42vw,640px)`), full height, `--surface`, one `--border-strong` line on its right,
  and a 3px gold rail on that edge (the chapter rail's dark-light-dark sweep in gold, no glow). No
  scrim, no radius.
- **Motion**: the panel slides in from the left (.64s) and out (.5s), both on `--ease-sheet`. The
  main screen moves with it over the same time and curve: the body's left padding grows by
  `--dock-w` (so `body` carries `transition: padding-left`), and the app's width `--pcW` is 100% of
  the room that is left, so the header, card and bottom row ease left and right in step with the
  panel, in both directions, with nothing under the panel on the way. Do not animate a registered
  length on `html`: the card jumps. Instant under reduced motion.
- **Layout**: head on one line (name, question, close at the right); presets stay at the top
  (sticky, wrap to two or three lines: Everything and Balanced on the first, the "Who's here"
  caption on its own line below them, left-aligned (centred on the tablet sheet), then the people
  presets); chapters scroll between, with Shuffle, Cards and Three on their own lines at the end
  of the list; only Draw Cards, a full-width gold bar, stays at the foot (sticky). Chapter rows
  48px, preset buttons 34px (desk-size controls). None and Open all stay at the Chapters heading
  (Open all reads "Close all" once every chapter is open).
- **Hover** (this block only, mouse): a pickable shows its picked colour with a faint underline
  (.35); a chapter row brightens its border to `--border-strong` and its name to cream (or keeps
  its chapter colour). The close x, None, Open all and Draw keep their existing hovers.
- **Closing**: the x, Esc, or a press of the main mouse button anywhere outside the panel (right
  and middle buttons are ignored). The outside press only closes; it is swallowed so it does not
  also press Next card or anything underneath.
- **No focus ring on the panel itself** (`.cat-area:focus-visible{outline:none}`, at every size,
  the phone sheet included): the sheet takes focus from script as a dialog, not as a control. The
  controls inside keep their own rings.
