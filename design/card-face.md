# The card face

The main card (`#card`) carries a frame and its category's name. Spotlight (`.party-*`) and Three's
picker have their own corners and are not part of this.

## What it is
- **Frame:** `<i class="card-frame">` in `#card` before `.card-body-inner`: two hairlines drawn as
  `::before` (outer, `--border-strong`) and `::after` (inner, the category's colour at full
  strength), and four `<i>` stepped squares, one centred on each corner of the two lines (card
  ground, `--border-strong` outline). On After Dark (`.mark-full`) the inner line is `--mark`; on a
  Wildcard it is `--gold` (`--cat` is not set). The inner line's colour eases (.5s, instant under
  reduced motion). The frame sits above the card back (z 6 over 5), so the start card and
  the Intermezzo wear it too and their lattice fills its inner line; it stays on the end-of-hand
  list and message, where the inner line keeps `--frame-rest` of its colour
  (`body.showing-hand-summary`, also in Spotlight). On a change of card it dips to `FRAME_DIP` and returns with the new card
  (`card.js` `playSwapOut` / `playSwapIn`).
- **Colour:** `card.js applyCardMark` sets `--cat` on the card to the colour the name has
  (`labelColor(levelColor(level))`) and removes it for a Wildcard or no card.
- **Name:** `.card-level` stands free at the top of `.card-body-inner` (absolute, centred by a flex
  row, not a transform, so the swap's lift still works), uppercase, tracking `.26em`, between two
  stripe pairs (`::before`/`::after`: a hairline across and a shorter one at the other end, in the
  name's own colour, faded outward by a mask). A Wildcard's name keeps Federo, gold and its own
  tracking at 17/18 of the size. The name stays hidden on the list and the end message.
- **Not here any more:** the corner brackets (`.card::before/::after`) and the Wildcard's own
  inner outline.
- **Unchanged:** the card's own border, the top colour line, the question size, After Dark's wash
  and mark, the "?" mark.

## Where the numbers live (`styles.css`)
Custom properties on `.card`, set at each breakpoint: `--frame-o-top` / `--frame-i-top` (outer and
inner line from the top edge: more room for the name), `--frame-o` / `--frame-i` (from the sides
and the bottom), `--frame-e` (how far a corner square sticks out), `--name-size`, `--body-top`,
`--body-bottom` (the question area's top and bottom padding). Name position (`top`, `left`,
`right`, `gap`), stripe height and the star's `top`/`right` are numbers of `--u`.

| | phone (up to 559px) | tablet (560px up, no computer layout) | computer (grid layout, `cqw` of the card) |
|---|---|---|---|
| `--u` | card width / 376 | 1px, 1.3px from 1024px | not used |
| top lines, outer / inner | 12u / 16u | 12u / 16u | 2.6 / 3.5 |
| side and bottom lines, outer / inner | 9u / 13u | 9u / 13u | 2 / 2.9 |
| corner square overhang | 3.5u | 3.5u | .7 |
| line width | 1px | 1px | 1.5px |
| name size | 18u | 14.4px (.9rem); 1.07rem from 768; 1.125rem from 1024; 1.18rem from 1180; 1.24rem from 1600; 1.125rem on a short window | 2.4 (Wildcard 2.3) |
| name top, side margin, gap | 27u, 46u, 11u | same, in u | 5.9, 14, 2.2 |
| stripe height | 7u | 7u | 1.5 |
| question area top / bottom | 47u / 24u | 47u / 24u | 8 / 3 |
| star top / right | 14u / 12u | 14u / 12u | 4.6 - 10px / 3.8 - 10px |

Tablet sizes follow the old steps: the frame and the star by the corner-bracket steps (20px, 26px
from 1024px, now `--u`), the name by the old label sizes (.8, .95, 1, 1.05, 1.1rem) grown by an
eighth as the phone's 16 became 18. The question's side padding is unchanged:
`--bracket-inset` (20 `--u`) + `--text-gap`.

## Room
- Every core-deck question breaks into the same lines and the question area does not scroll on
  phones 360 and 412 wide and at 1440x900 (`design/card-question-width.md`).
- A Twist line takes the bottom room: while it shows the question area has no bottom padding, and
  the line's own bottom padding (inner line + 6u; computer: inner line + 1.5cqw) keeps it above the
  frame's inner line.
- The end message is centred with equal top and bottom padding (`--body-bottom`). The hand list
  sits inside the frame; its last, fading row comes close to the inner line on a phone.
