# Animation fixes and design-scan fixes — agreement, 2026-10-21

Came from two read-only scans in the same thread: a design scan (emil-design-eng, mobile-native,
apple-design, design-critique, accessibility-review) and an animation audit (review-animations
standards). Owner's call, in their words: "Animations: fix them, and show mockups for 2.
Issues of design: fix 3 and 4. 1 I want to see, mock it up. 2 I don't feel this issue.
6 fix it. 7 leave it. 8 fix the button animations in code."

Read "mockups for 2" as swap direction 2, "the card breathes" (the one the Keeper advised).

## B) Looks — build now (looks-builder)

Animation faults, all fixed:
1. First draw of a hand: one clean landing instead of a drop plus a long wobble; the ghost
   cards slow down as they arrive instead of speeding up; the question shows as the card lands,
   not a second later. Total roughly half of today.
2. Turn to Intermezzo / hand list and back: same shape, about two-thirds of today's length;
   the face swap stays exactly at the midpoint.
3. Reduce motion: the first-draw drop and ghosts become a short plain fade (also design item 3).
4. Menu drawer, sub-drawer, The Deck sheet, desktop modal and their dark backdrops: open with a
   fast-start, soft-settle curve; close a little quicker than they open.
5. Buttons: transitions name what they change (no catch-all), the Draw button's gold moves in
   step with the rest, and Draw and the square buttons press in slightly when tapped
   (also design item 8, buttons part).
6. Opening entrance of the app: crisper curve, a bit shorter, small stagger kept.
7. Fast taps on Draw: only the latest card's swap runs; no flicker through cards in between.
8. Fold-out panels in The Deck (tray, presets, chapters): no shudder; chapters open quicker.

Design-scan items:
- 3: as animation fault 3.
- 4: hover highlights only on devices that really hover; nothing stays lit after a tap on a phone.
- 6: question text balances its lines, so a last word doesn't end up alone.
- 8: the button animations only (as fault 5). Notch/safe-area handling is not part of this.

What does not change: the normal card swap (it gets its mockup round first); any colour,
size, placement or wording; the dim helper text (it gets its mockup round first); everything
the vision and the hard rules fix.

## Mockup rounds (looks-builder, nothing built until the owner picks)

- **Card swap, direction 2 "the card breathes":** the card itself takes part in the swap (a brief
  breath of the card and its gold line) while the text changes out of sight, in one short beat.
  Shown moving, at real phone size, with the current swap next to it, several takes on direction
  2 and one bolder take for contrast.
- **Dim helper text (design item 1):** the lines under Three/Spotlight/Twist, the subtitle and
  The Deck's helper lines, made comfortably readable. Current next to the options, real phone
  size, one option that rethinks whether the lines are needed at all.

## Not taken up

Design item 2 (PC trio looks off before the first draw): owner doesn't feel it. Item 7 (iPhone
zoom on the custom-card dropdown): left. Item 5 (empty lower third on phones): not raised; stays
a possible later conversation.

## Done when

Every fault above is gone when tried as a player on phone and PC, reduce motion included;
nothing else looks or behaves differently; the tester confirms line by line, the reviewer reads
the code; the two mockup rounds are published, each on its own link.
