# The evening chooser (The Deck sheet)

The sheet "What kind of evening?": Start from (ten presets), a Chapters heading with None and
Open all, six chapter rows that unfold in place, Fixed Sets as the last row, Shuffle and Cards
(and Three) on their own lines, Draw Cards fixed. Chapter and category colours stay content
colour, set from `config.js`. Heading: `deck-heading.md`; docked on a computer: `deck-docked.md`.

## Chapter row (`.chapter`, 65px)
One continuous left line (3px) down the whole row.
- Off: `--dim` line, no tint.
- Fully on: the gilt sweep (`--ch-rail`, painted by a `::before` over the 3px border so it can
  fade; not a `border-image`), row tint `--ch` 9%, name in the chapter colour.
- Partly on (`.part`): a flat line of the chapter colour 70% into `--dim`, row tint 6.5%, name
  `--ch` 70% into `--muted`, count "n / total" in `--ch`; measured halfway between off and on, so
  it never reads like off.
- Names carry no glow. The row is one tap target (name button stretched over it) that switches the
  chapter.

**Wildcards row, on** (`.chapter-group--switch>.ch-fold--row[aria-checked="true"]`): lit exactly
like a fully-on chapter through the same rules: gilt rail (`--ch-rail`, painted by `ui.js` from the
wildcard card colour via `giltRailPaint`; phone and 1024px+ versions shared with `.chapter`), 9%
`--ch` wash, name in `--ch` (`labelColor` of the wildcard level colour), all eased over `--ch-ease`.
Off: unchanged. The "On/Off" state label keeps its own celadon. Reason: an on switch reads as lit
as an on chapter.

**Chapters change gently.** Tint, line, name and count colour ease over `--ch-ease` (.4s ease-out,
a local variable on `.chapter` and on `.chapter-group`); only rows whose state class changed move.
A count's number simply changes (no fade: a fading count is annoying). Wildcards follows the same rules.
A chapter a preset (or Colbert / The 36) hides or brings back opens or folds by its real height
(`setChapterHidden` in `ui.js` pins it, then moves `max-height`; `.28s` `--ease-out`), settling
from 6px above while it fades (in: fade trails by .06s; out: fade .16s, ahead of the fold); rows
that change together go 40ms apart from the top. No glow, flash or extra colour. Instant under
reduced motion.

**Fold target** (`.ch-fold`, right of the row, 60px wide): the count "n / total" in `--muted-l`
(`--cream` when partly on) over a celadon chevron, 7px apart, set off from the row by a 1px
`--border` hairline inset 14px top and bottom. No box, no outline. The chevron turns over when
open. The count says the state, the chevron says "opens", the hairline separates the fold from the
switch without a container.

**Panel** (`.chapter-panel`, the unfolded categories) follows its chapter's row state, so an opened
chapter with nothing picked doesn't look odd in colour. Off: left line 3px `--dim`, no tint.
Partly on: line chapter colour 70% into `--dim`, tint 6.5%. Fully on: line full `--ch`, tint 9%
(the row's own `.part` / `.on` values, found with `:has()` on `.chapter-group`; `--ch` is set on
the group by `ui.js`). Eases over `--ch-ease`, instant under reduced motion. Other sides `--dim`.
Each category is a 44px tap target; category words keep their own picked/not-picked look.

**Chapter hover** (mouse only, `hover:hover` + `pointer:fine`): the brighter outline goes round the
whole chapter, header row and open panel together, via `--ch-hover-line` on `.chapter-group`
(`--border`; `--border-strong` on the wide docked panel). Fixed Sets uses the same rule (its open
part keeps its own colours). The left line keeps its state colour; the header's bottom edge stays
open while unfolded. Lighting only the header looked like a separate box.

**Fixed Sets** (`.ch-fold--row`, 49px): the whole row is the fold. Name in cream `.68`, hint in
`--muted-l`, a 1px `--border` hairline (inset 10px) and a celadon chevron in a 60px cell on the
right. Inside, Colbert and The 36 are built exactly like category items (same dot, word, 44px
height, padding), in a panel padded like a chapter panel, so they start at the same left edge.

**None and Open all** (`#deselectAll`, `#foldAll`, at the Chapters heading, right): one quiet pair
in the `.deselect-btn` style (`--btn-quiet`, .75rem, caps, hover gold), a faint middle dot (opacity
.4) between them, the pair's right edge level with the chapter rows. "Open all" reads "Close all"
once every shown chapter is open. There is no All here.

**Shuffle and Cards** (`.seg-row`): two lines, labels SHUFFLE and CARDS in the same row-label style
as FIXED SETS (`.82rem`, `.09em`, caps, cream .68; no Federo). The label starts at the chapter-name
inset (16px) and has a fixed 5.5rem column so the choices of both lines align. The choices are
picked items (celadon word and dot), 48px tall, no boxes. The spice mark's "on" state is colour
only (no glow). On a computer (wide block) the same two lines plus Three keep this structure, one
setting per line, with no 16px inset (the foot sits flush with the panel edge); the foot sticks to
the panel bottom.

## The one picked look
`.cat-area :is(.mode-btn,.toggle-btn,.shuffle-toggle-opt,.limit-btn)`: presets, categories in open
chapters, Colbert, The 36, Shuffle and Cards all pick the same way, so there is one look for
everything pickable. The cream word and hollow ring of the category chip mark are gone.
- A 5px dot, then the word (`--pick-size` .8rem, .85rem from 1024px; Jost 300, .09em, caps), 7px
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
