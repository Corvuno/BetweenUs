# Under the card (main screen bottom)

The whole bottom of the main screen is one figure that answers the title: coloured ticks, the
count, one slim gold Next card with three streamline bands a side, and the words Spotlight and
Menu under the outer ends of the bands. On the phone Back, Three and Twist are
not here: Back is a swipe right on the card, Three is a setting in The Deck, Twist is a line in
the Menu (the computer shows all three, see Wide screens). So the question is the brightest thing.

## Phone
- `.controls-wrap` is a grid (`1fr auto 1fr`) and a size container. `--u` is 1px of the 375-wide
  mockup (`min(1.2px, 100cqw / 339)`), so 360 and 412 phones get the same figure scaled. Rows:
  ticks, count, Next card, words. Gaps between rows are 11px.
- Next card `#btn-next`: the gold button spec (see `DESIGN-SYSTEM.md`), one fixed width of
  `14.5em`, one type: font size and letter-spacing never change between Draw Card, Next Card,
  End of hand, Next hand and Three others, so the bar keeps its shape and place through a hand.
  Every label fits well inside the 14.5em in Federo 400 with `--track-2` spacing; the rest is even room
  each side. It is in em, not `--u`: the label's type is in
  rem and steps up with the screen, so the room each side stays even on every phone, tablet and
  PC. The first-draw and end-of-hand states change colour only (`.hold-mode`), never size or
  spacing. Spotlight keeps its own width (`flex-shrink:0`) so the bar's width never squeezes its
  hint on a 360px phone.
- Bands `.nav-lines` (`.nl-bands`): the bar under the name's streamline bands (`design/title-bar.md`,
  round 2 option 3), all gold. The owner chose them: "Do the first width and the last brightness"
  (`agreements/next-lines-r2`, `-r3`). Three bands 5.6px apart around the bar's centre leave the bar
  `6 * --u` from it and round the corner upward on one turning centre a side (radii 7.2, 12.8, 18.4),
  all three ending on one line 12.8px above the middle band; weights 1, 1.25 and 2 from the top, heaviest
  at the bottom. Outer end 24px from the screen edge. At three quarters of their strength (`opacity:.75`),
  so the button stays the brightest gold. Drawn from the outer end: the curl keeps its size and the
  straight part takes the room the bar leaves. `--nl` (registered `<color>`) is their colour: `--gold` in
  play; while the bar is in `.hold-mode` (end of a hand) it is `--im-target`, easing over `.6s` like the
  bar's own fade (`.2s` back to gold on the next hand), instant under reduced motion. No glow.
  Decoration only (`aria-hidden`); not drawn on a computer.
- Spotlight and Menu: `.quiet-word`, plain words (no icon, no box), Jost 400, `--fs-1`, `--track-3`,
  uppercase, `--stone`, `--gold` on hover (mouse only), press and keyboard focus (gold word
  with a thin gold underline, offset 6px, never a box). The tap area is at least 44px tall and
  wide and starts one row-gap under Next card, so it never overlaps it. Spotlight sits under the
  left ends, Menu under the right. Spotlight's first-visit hint (`.row-hint`, `--celadon-dim`) sits
  under its word and retires after the first tap; Menu has no hint. Jost and `--stone`, not
  the celadon Federo of the old play row: they are secondary and must not compete with Next card
  or the question.

## Wide screens
The computer keeps its layout from before the phone's bottom was redesigned (owner: "I thought the
whole thing was good on pc. Just revert the change there"), with today's card face.
- Top left: Selected deck, with Menu (`#btn-menu`, icon then word) under it.
- Top right (`#screenRow`): a right-aligned stack, icons at the outer edge: Three (`#btnPick`),
  Spotlight, Twist (`#btnTwist`), at the 31px * `--k` pitch of Spotlight's own Close. Each is a
  `.quiet-word`; hover and keyboard focus turn it gold and show its hint (`.row-hint`) beside it,
  never at rest. Three and Twist switch the same settings as The Deck and the menu
  (`syncSpotlightSettings` keeps them in step) and show "on" with an underline, as in Spotlight.
- Bottom row on the card's edges: Back (`#btn-prev`, arrow and word) left, Next card centred, the
  ticks with the count under them right. Back does what a swipe right and the left arrow key do and
  is dimmed (`.quiet-word:disabled`) when there is no earlier card.
- The bands beside Next card and the count's two rules are not drawn on a computer.
- `--pcW` (the card's width) is `100dvh - 174px * --k - 54px`, fitted so the card and the top
  groups agree within 2px from 1024 to 2560 wide.
- The menu's panel, Played, Favourites and Ways to play open from the right, The Deck from the
  left: a menu panel on the left would open behind The Deck when it is docked.
- On the phone Back, Three and Twist are hidden; in the fixed sets the stack hides with Spotlight.

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
- Three groups, each under its heading, in this order: "How you play" (The Deck, Three, Twist),
  "Tonight" (Start over, Save), "Yours" (Played, Favourites). Ways to play and Show hints again
  stay at the foot. On the phone a metal divider (`.menu-rule`) sits between the groups, two in all;
  the computer's panel separates them by their headings.
- Three (`#d-three` phone drawer, `#s-three` computer panel) is built like Twist's line: Three's own
  icon (the one of `#btnPick`), "Three", "pick one of three", On / Off at the right. A tap flips
  `#pickToggle` (The Deck's own setting, so The Deck, the top-right button and Spotlight follow),
  then closes the menu; `fillMenu` reads On / Off from `pickMode` each time the menu opens. It is
  hidden in the fixed sets, with Twist.
- Save (`#d-save` phone drawer, `#s-save` computer panel), line "take this evening with you", action
  word "Save", in the existing row style; hidden until the first card is drawn (`state.sessionLog` is
  empty before), so before it "Tonight" holds Start over alone.
- On a computer: a panel from the right edge (under its button); Played, Favourites and Ways to
  play open in its place on the same side; The Deck from the left. Close buttons stay at the top
  right of each panel.
- The phone's menu shows all of itself without scrolling. Every gap in it is a share of `--m` on
  `#menuDrawer` (10px; 7px on screens up to 760px high; 5px up to 680px), and the sheet may take 92% of
  the screen's height. A line stays at least 44px tall. Adding a line means checking it still fits
  (the test "menu on a phone: every line and the foot are on screen").
