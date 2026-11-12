# Side rails and chapter rails on wide screens

`gilt.js` switches every rail to its intense stops from 1024px; the phone's rails are untouched.
- **Chapter rows, 1024px and up:** the sheen's centre stop is `--rail-l` 70% into `--rail-m`
  (`color-mix(in oklab)`), a pinch back from the near-white intense stop; ends, width (3px),
  colours, tint unchanged. The same pull-back the card's top line got, gentler because the line is
  only 3px. The rule sits in its own `@media(min-width:1024px)` near the end of the chapter rules;
  if `giltStopsIntense` changes, look here.
- **Three and Spotlight's pick-three rails** (`.card-area .pick-opt-text::before`,
  `.party-picker .pick-opt-text::before`), in the WIDE SCREENS query: 5px wide (the phone's is 3px
  beside text a fifth the size), a vertical sweep dark (`--pc-solid` 60% into black) then
  `--pc-solid` at 30% then sheen (`--pc-solid` 62% into white) at 50% then back, plus a crisp 1px
  lit edge (the sheen colour) down the left, for a rolled-metal edge. No glow, no blur. The same top
  and bottom fade mask as on the phone. Built from `--pc-solid`, which `openPicker()` sets per
  option, so it follows every category colour without new stored values.
- **The Deck on a mouse** (`min-width:1024px`, `hover:hover`, `pointer:fine`): every pick in the
  sheet (presets, who's here, categories, dials) is 38px high (`--pick-h`) instead of the touch
  44-49px, so the presets don't take a third of the sheet and push Chapters below the fold. Touch
  devices and the phone keep 44-49px.
