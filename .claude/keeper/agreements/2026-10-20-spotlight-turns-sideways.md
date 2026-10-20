# Spotlight turns for a phone held sideways — 2026-10-20

Owner: the Sideways/Upright word "changes the layout somewhat … people don't understand the
use. Also it does not show in sideways position. Can we detect if the screen is rotated?"
Keeper's proposal, owner: "This sounds like the right way to move!"
Areas: C (how it works), B (what the turned screen looks like). A doesn't change.

## Why

Today the word only puts the wide layout on a phone still held upright; nothing turns, so the
word doesn't mean anything to people. With rotation lock off the browser already turns the
screen and Spotlight follows; with rotation lock on the browser keeps reporting "upright" and
only the motion sensor knows the phone is on its side.

## Changes

1. When Spotlight is shown "sideways" on a screen that is physically upright (rotation locked),
   the Spotlight content is really turned a quarter so it reads correctly with the phone held
   on its side — the full sideways layout (as a real sideways phone shows it), filling the
   screen.
2. Android (and any browser that gives motion/orientation readings without asking): Spotlight
   reads the phone's tilt; holding it on its side turns the content (towards the side it's
   tilted), holding it upright turns it back. No popup. On those phones the word is not shown.
3. iPhone (motion only with a system permission popup): no permission is asked. The word stays
   on the right edge as the way in; tapping "Sideways" now really turns the content; once
   turned it reads "Upright" and turns it back.
4. Rotation lock off / real sideways screen: unchanged — the browser turns it, Spotlight
   follows, no word.
5. Leaving Spotlight always returns to upright.

Keeper's decisions: the word disappears where automatic turning works; the turned state's
word reads "Upright"; no motion-permission popup anywhere.

## Stays

The sideways layout itself (L2 sideways, G2 dividers, Twist divider), every control's job,
keyboard keys, the main screen.

## Done when

Checked on an emulated locked upright phone: tapping the word turns the card into a readable
sideways layout and back; with simulated tilt readings the content turns and returns by
itself and the word hides; a real sideways screen behaves as today; pick-three, a Twist card
and end of hand all read correctly turned. Tester line by line, reviewer on the code, Keeper
on the screenshots; tests pass.

## Built — 2026-10-20

Live on main (5fc4f14 + review fixes ea0d66e). Tester: every point met (tilt and iPhone only
simulated). Reviewer: one bug (closing during the 350 ms hold could leave the next open turned),
sensor read while closed, missing vh/vw fallback, switch state for screen readers — all fixed,
re-review clean. Tests 58/58 on the final merge. Still to watch on a real phone: the tilt
direction mapping and the feel of the turn (no animation). Open on main, not from this build:
`npm run check:static` flags two findings in presentation.js (from ce3b300).
