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

---

## Owner's picks, 2026-10-21 (later the same day)

**Helper text (build now, looks-builder):**
- Hint lines under Three / Spotlight / Twist: look B — tone `--celadon-hint` step (#6f8579, scoped to these hints only:
  the main menu's sub-lines that share the token stay as they are, the owner hasn't seen them change) and the hints a
  touch larger (14 → 15px), phone layout only (PC hints unchanged).
- "Selected deck · tap to change": stays as it is (owner: the hint must keep its difference from "Selected deck", and
  it reads fine today).
- The Deck sheet's "Start from" and "Chapters": look B (new `--text-helper`, #8c8071).
- Title subtitle ("Just enough edge."): look C (`--muted-l`), weight unchanged.
- Context from the owner: the hints exist because people didn't know what Three / Spotlight / Twist do; they
  disappear after each control is used once. They stay.

**Card swap:** A and D are too flashy. Owner likes B and C and asks whether they can be combined. Next: a mockup of
B+C next to B and C, side by side, before anything is built.

## Card swap decided, 2026-10-21

Owner: "we are doing B+C" (round 2, https://claude.ai/artifact/77EFUumvT28VWTEiCPxpFn, mockup in
`2026-10-21-card-swap-round2-sbs/`, take `railanswer` in its shared/swap.js).
- Build B+C exactly as the mockup: one beat of about 350ms. Out: the rail flares lighter from the centre
  as the text leaves, the frame tightens a hair. In: the rail settles, the frame eases back, the new text
  rises. The text changes while invisible.
- Applies to Next and Back on the card screen, phone and PC. Not to the first draw (keeps its landing), the
  Intermezzo turn, Three, or Spotlight (its own question change stays).
- The old 1s accent bloom on every swap goes (the chosen mockup doesn't have it); the rail's colour still
  eases to the new category colour.
- Frame only: the question text is never scaled while visible; no glow; hairlines stay hairlines.
- Reduced motion: a plain quick fade. Fast taps land on the latest card.
- Clarified by the Keeper (review, 2026-10-21): "not Three" meant Three's own picker; a card chosen in Three
  lands on the card with the same B+C swap, so there is one swap on the card screen. The first draw keeps its
  accent bloom (only the Next/Back bloom goes).
