# The Deck, docked on a computer

The computer layout (`html.pc`, set by the script at the top of `between-us.html`: a computer
window at least 720px across, where that layout stops fitting, and a touch screen at least 900px across whose screen's short side is 600px or
more) shows The Deck as a panel from the left edge, under Selected deck, which opens it. The menu,
Played, Favourites and Ways to play are the same kind of panel from the same side, because their
button sits there too. The phone layout (phones, and tablets held upright) keeps the phone sheets;
there is no centred-window layout in between.
Docked, on a window with a mouse at least 1280px wide, 560px tall and 5:4 or wider
(`dockedQuery` in `selection.js`, which `syncDock()` in `ui.js` applies on open and on resize),
the panel sits beside the card and the main screen makes room. 1280px is the width where the
header (Selected line, logo, Three / Spotlight / Twist) still has its room with the panel open: the
card is then 604px, the same as docked at 1280x720. Narrower, the same panel lies over the card
with the scrim behind it.

- **Panel** (`.cat-area` in "THE DECK AS A PANEL"): `--dock-w`
  (`clamp(min(560px,100vw - 48px),42vw,640px)`), full height, `--surface`, one `--border-strong` line on its right,
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
  presets); the line (`deck-chooser.md`, "The line": eight stations on one metal line, category
  lines always on) scrolls between, with the plate (Shuffle, Cards, Three, a row each) at the end
  of the list; only Draw Cards, a full-width gold bar, stays at the foot (sticky). The rows, plate
  and hints are the phone's; preset buttons 34px (desk-size controls). None and Open all stay at the
  Chapters heading (Open all reads "Close all" once every chapter is open).
- **Hover** (this block only, mouse): a pickable shows its picked colour with a faint underline
  (.35); a station's name brightens to cream (an on group keeps its colour). The close x, None, Open all and Draw keep their existing hovers.
- **Closing**: the x, Esc, or a press of the main mouse button anywhere outside the panel (right
  and middle buttons are ignored). The outside press only closes; it is swallowed so it does not
  also press Next card or anything underneath.
- **No focus ring on the panel itself** (`.cat-area:focus-visible{outline:none}`, at every size,
  the phone sheet included): the sheet takes focus from script as a dialog, not as a control. The
  controls inside keep their own rings.
