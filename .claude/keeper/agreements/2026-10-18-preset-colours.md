# Preset colours: Custom wears its categories (agreed 2026-10-18)

Wish (owner): "Preset Custom needs a better colour. It's the one someone went out of their way
to create, so it might as well show." Plus: the tans (New People / Strangers, Family) are too
close to gold. Mockup round 1: `2026-10-18-preset-colours-mockup/round1.html`. Owner picked
option C ("I really like C, both the Custom and the other colours"), asked for the logo to
change colour between breaths, then: "Just build it."

## B) Looks — what changes
- Strangers (New People) preset colour: #8fd14f (yellow-green). Family: #ee7a35 (orange).
- Custom no longer has one colour (copper #C67B28 retired for Custom); it wears the colours
  of the categories picked, in the order they appear in the app's category list:
  - 1 category: everything in that colour, still.
  - 2+: the logo's inner line pairs split left/right between the first two; the start-card
    rule and the preset name are a soft blend of the first two or three (never more than three
    colours, so it never turns into a rainbow).
  - The start-card diamond breathes (existing breath) and switches to the next picked
    category's colour at the faint point of each breath, cycling through ALL picked categories.
- Same on phone, Spotlight and PC.

## What does not change
- The logo's copper centre diamond on the title line stays copper.
- The top logo never animates; only the start-card diamond (before the first draw) cycles.
- All other presets, all category and chapter colours, the gold and celadon jobs.
- No glow, no new elements.

## Done when
Custom with 1, 3 and 8 categories, Strangers and Family look as in round 1 option C on phone,
Spotlight and PC; the diamond changes colour only while faint; DESIGN-SYSTEM.md's frame
colours section says what Custom does now.

## Built 2026-10-19 (live on main, 6c0d987) — differences from the text above
- The start-card rule breathes with the diamond (since c6aaf86), so it switches colour with it
  instead of being a blend (Keeper's call).
- The name is a left-to-right colour run of the shown colours, never an average (an average
  came out mud/mustard; sent back once).
- With more than three picks, the shown colours are the picks furthest from gold and from each
  other (first picks were often yellow/orange and read gold again; Keeper's call). The diamond
  still cycles through every pick.
- Spotlight shows no start mark or preset name, so nothing changes there. The pause card
  (Intermezzo) diamond stays on one colour.
