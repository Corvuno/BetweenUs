# Under the card (main screen bottom)

The whole bottom of the main screen is one figure that answers the title: coloured ticks, the
count, one slim gold Next card with three gold hairlines a side (a hairline fading outward), and
the words Spotlight and Menu under the outer ends of the lines. Back, Three and Twist are not
here: Back is a swipe right on the card, Three is a setting in The Deck, Twist is a line in the
Menu. So the question is the brightest thing.

## Phone
- `.controls-wrap` is a grid (`1fr auto 1fr`) and a size container. `--u` is 1px of the 375-wide
  mockup (`min(1.2px, 100cqw / 339)`), so 360 and 412 phones get the same figure scaled. Rows:
  ticks, count, Next card, words. Gaps between rows are 11px.
- Next card `#btn-next`: the gold button spec (see `DESIGN-SYSTEM.md`), one fixed width of
  `14.5em`, one type: font size and letter-spacing never change between Draw Card, Next Card,
  End of hand, Hold to continue and Tap to flip card, so the bar keeps its shape and place through
  a hand. The longest label, "Hold to continue", is 11.6em wide in Jost 400 with `.14em` spacing;
  the rest of the 14.5em is even room each side. It is in em, not `--u`: the label's type is in
  rem and steps up with the screen, so the room each side stays even on every phone, tablet and
  PC. The first-draw and end-of-hand states change colour only (`.hold-mode`), never size or
  spacing. Spotlight keeps its own width (`flex-shrink:0`) so the bar's width never squeezes its
  hint on a 360px phone.
- Hairlines `.nav-lines`: three 1px lines at -6px, 0, +6px from the bar's centre, starting
  `6 * --u` from the bar, outer ends 40, 24 and 40 from the screen edge (the middle one longest),
  from opacity .7 at the bar to .2 at the outer end (`color-mix` of `--nl`, one gradient per line
  so the fade follows each line's own length). `--nl` (registered `<color>`) is the lines' colour:
  `--gold` in play; while the bar is in `.hold-mode` (end of a hand) it is `--im-target`, easing
  over `.6s` like the bar's own fade (`.2s` back to gold on the next hand), instant under reduced
  motion. No glow. Decoration only (`aria-hidden`); hidden on PC.
- Spotlight and Menu: `.quiet-word`, plain words (no icon, no box), Jost 400, 11.5px, `.22em`,
  uppercase, `--btn-quiet`, `--gold` on hover (mouse only), press and keyboard focus (gold word
  with a thin gold underline, offset 6px, never a box). The tap area is at least 44px tall and
  wide and starts one row-gap under Next card, so it never overlaps it. Spotlight sits under the
  left ends, Menu under the right. Spotlight's first-visit hint (`.row-hint`, `--row-hint`) sits
  under its word and retires after the first tap; Menu has no hint. Jost and `--btn-quiet`, not
  the celadon Federo of the old play row: they are secondary and must not compete with Next card
  or the question.

## Wide screens
- The figure is drawn without its words: ticks and count centred above, Next card centred between
  its three hairlines (as long as the card is wide), nothing under the line ends. The app grid's
  middle column is Next card's own width (`auto`: the `14.5em` bar), so the lines start 6 units
  from the bar. `--pcW` (the card's width) takes `168px * --k + 100px` as everything on screen that
  isn't the card (header, margins, ticks, count, Next card; fitted to the measured layout at 1280
  to 1920 wide, card and top groups agree within 4px).
- Top right: Spotlight above Menu, right-aligned with the card's right edge, mirroring Selected
  deck on the left (two lines each side). Each is the same `.quiet-word` with an icon at the outer
  edge (Spotlight: nested squares, Menu: three lines, Save: two chevrons over a line; viewBox 24,
  stroke 1.7, miter; shown at `20px * --k` in `styles.css`): Jost, `max(11px, 14px * --k)`, `.22em`,
  `--btn-quiet`, gold on hover and keyboard focus. The pitch is 31px * `--k` (the pitch of
  Spotlight's own Close button). The hint (`.row-hint`, italic, `--row-hint`,
  `max(13px, 16px * --k)`) sits left of the word, shown on hover and focus only, never at rest.
  Reason: the pre-redesign top-right stack, without Three and Twist, with Menu and Spotlight moved
  up from under the card.

## Before the first card
The start screen, and after Start over until a card is drawn: Ways to play (`#btnWays`, no icon)
takes Spotlight's place, same slot and style, so nothing moves when the word changes
(`body.before-first-card` swaps it with Spotlight; the icon-less word keeps Spotlight's box height
on a computer). It opens the Menu's Ways to play sheet. Its hint is the Menu's "seven ways round
the table", retired after the first tap (`HINTS.waysWord`, `hint-ways-word-taught`), on a computer
on hover. Spotlight has no ways-to-play view.

## End of a hand (phone and computer)
Save (`#btnSave`, the evening's file, the same function as Played > Download the list) takes
Spotlight's place: same slot, size and style, so nothing moves between a card and the pause. On
the phone it is the left word under the card with the hint "take this evening with you" (time of
day follows the device, `renderHandSide`); on a computer it takes Spotlight's slot top right. The
hint retires after the first tap (`HINTS.save`, `hint-save-taught`) and returns with "Show hints
again". Change and the icon row (`#handActionsRow`) are gone; The Deck stays in the Menu and under
Selected deck. Colbert and The 36 hide Spotlight but keep Save.

## Menu
- First row: Save (`#d-save` phone drawer, `#s-save` computer panel), line "take this evening with
  you", action word "Save", in the existing row style; hidden until the first card is drawn
  (`state.sessionLog` is empty before).
- On a computer: a panel from the right edge (under its button); Played, Favourites and Ways to
  play open in its place on the same side; The Deck from the left. Close buttons stay at the top
  right of each panel.
