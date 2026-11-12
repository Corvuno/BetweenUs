# How the Custom edition is coloured

"Custom" (no preset button matched) wears the colours of the selected, playable categories in
CATEGORIES order (`customPicks` in `presentation.js`). Reason: Custom is the one the player made,
so it shows. Token meanings: `--preset`, `--preset-a/-b`, `--preset-deep` in `DESIGN-SYSTEM.md`.

- One category: that colour everywhere, still.
- Two or more: up to 3 "shown" colours are chosen (`shownPicks`: the pick furthest in Lab from
  gold first, then each furthest from those chosen, kept in CATEGORIES order, so many warm picks
  never read gold).
- The logo line pairs split between the first two shown colours; the preset name is a soft
  left-to-right gradient of the shown colours (never more than three, `.tok-multi` / `--tokg`;
  clipped text); `--preset` and `--tokc` are the first shown colour (never an average).
- The start card's diamond and rule (`--preset-deep` on `#card`) step through ALL picks starting at
  the first shown colour, switching at the faint point of each breath (one Web Animation locked to
  the diamond's breath, no timers; cancelled when the start card leaves). Reduced motion: first
  colour, still.
- The top logo never animates.
