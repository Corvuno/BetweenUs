# The evening chooser (The Deck sheet)

The sheet "What kind of evening?": Start from (ten presets), a Chapters heading with None and
Open all, eight stations on one metal line (six groups, Wildcards, Fixed Sets), the plate with
Shuffle, Cards and Three, Draw Cards fixed. Chapter and category colours stay content colour, set
from `config.js`. Heading: `deck-heading.md`; docked on a computer: `deck-docked.md`.

## The line (`.chapter-group` x 8 in `#chapters`)
No row boxes, no tint, no border per row, no dots. One double hairline rail (two 1px
`--border-strong` lines, 5px apart) runs down the left of all eight stations; each station is one
`.chapter-group`, indented 36px from the sheet edge, and draws its own stretch of the rail, so
a group a preset hides takes its stretch with it. A 1px `--gold` tick starts every row at the rail,
its length by group: 12, 18, 24, 30px for Arrive to Into the Deep, then 24, 18 for Between Us and
After Dark, 12 for Wildcards and Fixed Sets (`--tick`). Rows are 15px (`--station-pad`) above and below.
- **Name**: Jost 300, caps, `--fs-7`, `--track-2`, line height 1.15 (`--name-lh`); wraps to a
  second line where the room is short (Beneath the Surface at 360px). **Line** under it: Federo,
  `--fs-3`, `--track-text`. Names and lines are the group's own words.
- **State is the rail beside the row.** The stretch between its two rail lines fills with the
  group colour as the gilt sweep (`--ch-rail` from `giltRailPaint`, dark-light-dark) from the top,
  as far as the share of its reachable categories that are on (`--share`, 0 to 1, set by `ui.js`):
  a fill bar. Partly on, the two rail lines of the whole stretch also take the group colour (`--ch`),
  so the fill reads against the full length. Fully on: name `--ch`, line `--sand`. Partly on: name
  `--ch` 70% into `--muted-l`, line `--sand`. Off: plain rail, name `--stone`, line
  `--text-helper`. Owner: the fill that grows with the categories is "really elegant"; the coloured
  full length and the count make partly on clear. Fill and line colour change over `--ch-ease`
  (.4s ease-out); instant under reduced motion. Tapping the name
  switches the group (the name button stretches over the row).
- **Fold** (`.ch-fold`): the count "n / total" (`.ch-ct`, Jost `--fs-2`, `--stone`; the group colour
  when partly on) over a celadon chevron, 7px apart, at the right of the name row, no hairline, no
  box. At least 44px (`--fold-w`), its own width taken from the name (`--fold-room`); the chevron
  turns over when open. The count says there is more inside and how much of it is in (owner: it
  "needs something to say, there's more here to explore"). It never touches the selection.
- **Fold timing**: opening or closing a group's categories, and a group a preset hides or brings
  back, takes `foldMs` (top of `ui.js`): 170ms plus 0.55ms per pixel travelled, at most 560ms,
  closing at 0.8 of that, so a tall drawer takes longer than a short one (owner: "something taller
  should take longer").
- **Open group** (`.chapter-panel`): its categories under its line, indented with the name, no
  border or tint; the category lines, two columns, the hold and its hint are as in
  `deck-category-lines.md`; the picked look of a category is unchanged. The group's stretch of rail
  runs the whole height, open part included.
- **Wildcards** (`.ch-fold--row` in `.chapter-group--switch`): metal fill in its gold (`levelColor(WILDCARD_LEVEL)`)
  while on; the On / Off word at the right in celadon (`--text-helper` when off) where the chevron
  sits; still one switch for the whole row.
- **Fixed Sets** (`.ch-fold--row` in `.chapter-group--fixed`): pale metal (`FIXED_SETS_COLOR`,
  cream-gold #d9cfbb, in `ui.js`) only while Colbert or The 36 is picked (`.on` on the row, set in
  `syncIntentUI`); the whole row is the fold, a chevron at the right. Colbert and The 36 inside are
  built exactly like category items.
- **A group a preset hides or brings back** opens or folds by its real height (`setChapterHidden`
  in `ui.js` pins it, then moves `max-height` over `foldMs` of that height, `--ease-out`), settling from 6px above while it
  fades; rows that change together go 40ms apart from the top. Instant under reduced motion.
- **Hover** (mouse only, docked): the name of an off or partly on row goes to cream; an on row keeps
  its colour.

**None and Open all** (`#deselectAll`, `#foldAll`, at the Chapters heading, right): one quiet pair
in the `.deselect-btn` style (`--stone`, `--fs-1`, caps, hover gold), a faint middle dot (opacity
.4) between them, the pair's right edge level with the chapter rows. "Open all" reads "Close all"
once every shown chapter is open. There is no All here.

**The plate** (`.seg-row`): Shuffle, Cards, Three and About in one double frame under the line: outer
1px `--border-strong`, a 4px gap, inner 1px `--border` (`--plate-gap`), a row (`.seg`) per setting
split by `--dim` hairlines, 12px inside the inner frame (`--plate-pad`). The name is at the left
in a fixed 5.5rem column (`.seg-head`: `--fs-2`, `--track-1`, caps, `--stone`; no Federo), the
choices right of it in the one picked look (48px tall on the phone), so every row's choices
align. Cards keeps 5, 10, 20 and All (All shows outside Arc); Random and All fit one line on a
360px phone. On a computer the plate is the same, with the foot scrolling with the list.

**About** (`#lean`, the You–Us lean, picked by the owner from round 1 as "the rail"): the chapter line
on its side. YOU at the left and US at the right in the pick word's look, the side it leans to in the
picked look. Between them two `--border-strong` rails 5px apart, a 22px gold mark through the middle, a
gold mark under each of the other eight steps, longer towards the ends, and a 12px celadon diamond with a
`--surface` halo that slides over nine steps; the stretch from the middle to the diamond fills with
celadon metal. An invisible range input over the rail takes touch, keys and screen readers. A preset
moves it; nothing else does. Owner on the rings option: "really cool, though way too complex for what
it does".

**Their hints** (`.seg-hint`, `HINTS` entries `shuffle`, `cards`, `three` and `lean` in `state.js`): one
text under each setting's choices, aligned with them (`--seg-head-w`), in the look of the
categories' hint (Federo `--fs-3`, `--muted-l`); phone and computer alike. Words, chosen by the
owner: under Shuffle "Arc lets the questions go deeper step by step and come back up by the last
card. Random: any order."; under Cards "how many questions before a pause"; under Three "Each draw
shows three questions; you pick the one you ask or answer."; under About (the Keeper's words) "Towards
You: more questions about the one answering. Towards Us: more about the two of you." Each goes for good once its own setting is
changed (Three wherever it is changed, The Deck, the menu, Spotlight or key 3); "Show hints again"
brings all back. A row closes up when its hint goes.

## The one picked look
`.cat-area :is(.mode-btn,.toggle-btn,.shuffle-toggle-opt,.limit-btn)`: presets, categories in open
chapters, Colbert, The 36, Shuffle and Cards all pick the same way, so there is one look for
everything pickable. The cream word and hollow ring of the category chip mark are gone.
- A 5px dot, then the word (`--pick-size` `--fs-2`; Jost 300, `--track-1`, caps), 7px
  apart, `0 9px` padding. Not picked: word is the item colour mixed 42% into cream .5, dot at .5
  opacity. Picked: full word colour, dot at full opacity, 1px underline (.7 opacity) 1em under the
  text centre, inset 9px. No glow, no box, no ring, no outline.
- Variables per item: `--pc` the item's own colour (dot; `--mc` presets, `--c` categories,
  `--list-col` fixed sets, `--celadon` Shuffle/Cards), `--tc` the word and underline colour
  (default `--pc`), `--pick-h` tap height (presets 49px, categories and fixed sets 44px,
  Shuffle/Cards 48px).
- **Lightened word colours** (text only, this sheet only, owner-approved). The real colours are too
  dark to read as small text (below 4.5:1 on the sheet colour #161310), so `--tc` is a lighter
  version of the same hue: World #3b8c68 (real #2d6a4f), Roots #9f7755 (#866448), Deep #6979c3
  (#4e60b8), Raw #008b9d (#008495), Shadow #837899 (#615874), Us: Intimate #cd5861 (#a13039), Flesh
  #c45b81 (#832f4d), Carnal #db4b52 (#8d1c22), Bare #dc3b96 (#b52074), Kink #ce4d9e (#742055), Close
  friends preset #8875aa (#75609c). The dot, chapter lines, cards and everything outside the sheet
  keep the real colours; `config.js` is unchanged. The dimmed (not picked) state of these sits at
  about 4.2 to 4.6:1, by design quieter than picked.
