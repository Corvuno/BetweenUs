# Card question width and phone card scaling

## Side margin
On the phone/tablet card the question's side padding is `--bracket-inset + --text-gap` (both set
on `.card`; inset 20px phone, 26px from 1024px where the bracket grows (inset 26px, bracket
30px), gap 8px), so the text uses the width out to just inside the corner-bracket lines. The
brackets read the same `--bracket-inset`, so moving one moves both. On a 412px phone the side
padding is 28px (a middle ground: at 31px most cards break into the same lines as at 36, only 27
of 408 main-deck questions differ). The PC grid layout (`min-width:900px`) sets its side padding to
7cqw, the bracket inner edge, and Spotlight's side padding already clears its frame corners. Font
size is unchanged and never scales with length.

No clear square at all four corners (bracket inset + bracket size + 6px): measured across all 408
main-deck questions it changes nothing at 390px and wider and cannot help at 375px and below without
making the card scroll. Its code is kept in
`.claude/keeper/agreements/2026-11-05-margin-corners/corner-mechanism.patch`.

## Every phone shows the card as a 412px phone does
Up to 559px the card scales as one piece. `.card-area` is the container
(`container-type:inline-size`) and `--u: calc(100cqw / 376)` is 1px on the reference card, a 412px
phone's card (376px wide, 243.5px tall). Everything inside the card is a number of `--u`:
- question `26.496 * --u` (line-height stays the unitless `1.52`);
- label `16 * --u` (letter-spacing stays in `em`);
- body padding `18 / 10` top and bottom, gap `10`;
- `--bracket-inset` `20 * --u`, `--text-gap` `8 * --u` (sides 28 at the reference);
- bracket arm `24 * --u`; star size and position; the Twist sentence; the end-of-hand message and
  the watermark marks.

The end-of-hand list (`.is-hand-list`, `.hd-list`) is deliberately not scaled: it is text to read.
At 412px nothing changes; at other widths letters and distances grow and shrink with the card's
width and never with the question's length, so a question breaks into the same lines on every
phone. Hairlines do not scale: card border and bracket strokes 1px, top bar 3px. The 1px card
border is the one thing that does not scale, so the body's side padding adds `--u - 1px` to stay
exact (the text area is `312 * --u` wide). Phone sizes follow the card, not the root font size
(`rem`): the player's text-size setting no longer changes the card's text, only the card's width
does (the card is sized like a picture). The block sits after the hand-list rules in `styles.css`
so it wins over their plain sizes. The tablet (560px up), PC and Spotlight are untouched. Measured
over all 408 main-deck questions against 412px: 405 to 407 break identically at 340 to 430px; the
few that differ are within 0.05% of the line width, where the font's own rounding decides.
