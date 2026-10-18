# Spotlight: three stacked on PC, new flourish, Close at the bottom — 2026-10-15

Agreed with the owner 2026-10-15. Areas: B (looks), with a C touch (where controls sit).
A doesn't change. Builds on the Three redesign (`2026-10-15-three-redesign.md`), already live.

## B) Looks

1. PC: the three options sit one above the other, not side by side. Sideways phone keeps
   them side by side as now.
2. The small gold diamond on the divider line between options goes, everywhere in Spotlight
   (phone, sideways phone, PC). In its place a custom flourish made for this deck, built from
   the same hairline. The corner card markers stay (owner: "they are card markers").
3. The gold line under the question that fades to one side (shown on phone) also shows on PC.

## B + C) Where the controls sit — phone and PC

4. Close moves to the bottom of the screen, at the spot where the Spotlight button sits on
   the main screen: open and close in the same place (owner: buttons that do opposite things
   belong in the same area).
5. Pick-three screen: "‹ One card" at the top goes. The Three toggle does that job, at the
   spot where "Draw three" sits in the bottom row.
6. The other controls (back, next, Twist, Three, count, star) get a new arrangement to make
   room. Owner left this open: "figure something out" — it comes as options.

Raised to the owner: Close at the bottom sits near Next/Back, so an accidental exit
mid-hand gets easier on a phone. Owner accepted the move.

## Stays

The main screen and its pick-three screen; what every control does; keyboard keys; corner
markers.

## Next

One mockup round, current Spotlight shown next to it: three flourish options and three
control layouts (at least one a real rethink of the bottom), on phone and PC. Owner picks;
looks-builder builds from the chosen mockup.

## Done when

Checked by the Keeper against the chosen mockup on phone, sideways phone and PC, in normal
play and while picking from three; `node tests/run.mjs between-us.html` passes.

## Round 1 outcome — 2026-10-16

Round 1: https://claude.ai/artifact/7typD67ntJH9DqhuxGPM6k
- Layout: **L2** chosen (arrows in the bottom corners, Close in the gold middle, Twist and
  Three in the top corners beside the count, star under the count). Owner: "L3 is a stroke of
  brilliance … L2 is more spotlight. L3 is too much a menu, it takes away from the card."
- Point 3 reversed: the fading line under the question is **removed** on phone and PC
  ("it adds little").
- Flourishes F1–F3 rejected: "random flourishes; they have to fit the space and work in the
  theme." A second flourish round follows once the target is clear.

## Carried in from the end-of-hand thread — 2026-10-16

From `2026-10-16` sections of `2026-10-15-end-of-hand-intermezzo.md` (live on main, 91f7b29):
at the end of a hand only, Spotlight shows a quiet centred hint line above the bottom row
("Tap to flip card" / "Hold to continue", #partyEndHint). In L2 it sits just above the
Back · Close · Next row. At the end of a hand the count slot stays empty and its little
rules stay hidden (owner). The L2 build starts from current main so none of this is lost.

## Owner's answers — 2026-10-16

- Flourish target confirmed: it comes out of the space and the screen's own pieces (the
  hairline, corner markers, category stripe), small like the diamond, part of the line, and
  cohesive with the whole look.
- The diamond between Twist and Three and the diamonds beside the count go too.
- Close at the very bottom on phone: fine for now.
- The phone's portrait/landscape switch keeps working in the new layout: part of this job.
- Twist card's ornament line: owner asked to be shown it before deciding (in round 2).

## Round 2 outcome — 2026-10-16

Round 2: https://claude.ai/artifact/DrA8o1sX3hSexpy6QVG2qm
- Flourish: **G2, colour stripes** (hairline straight through, a short bar in each neighbour's
  category colour on either side). On the vertical divider (sideways phone) the stripes are
  dimmed somewhat.
- Twist card: the line between question and twist text gets the flourish too (owner: "that's
  where the flourish comes in"). Open: what colour the twist side's bar takes.
- Orientation switch: owner asked for better ideas than the two outlined rectangles → a
  small mockup round of its own.
- Mockup slip to avoid in the build: count and star stay at the top in pick-three; the count
  needs room from the top edge when the orientation switch shows.

## Round 3 outcome — 2026-10-16

Round 3: https://claude.ai/artifact/XSgNimRgFnVa6po1XvErmj
- Orientation switch: **O3, a word on the edge** ("Sideways" / "Upright", vertical on the
  right edge between two short hairlines).
- Fix included: pick-three on an upright phone switched to sideways falls apart (narrow
  columns, divider over a label, an option cut off) — it should read like a real sideways
  phone's pick-three.
- Twist card bar colour: owner "figure it out" → shown as a small set of options (round 4)
  while the rest is built; Twist's divider is done once picked.

## Build now (everything decided)

L2 layout (phone, sideways phone, PC); Close bottom centre in gold with the Spotlight symbol;
Three toggle replaces "‹ One card"; three options stacked on PC; G2 dividers (dimmed when
vertical); question line removed; diamonds beside the count and between Twist and Three
removed; O3 switch; forced-sideways pick-three fixed; count and star stay visible in
pick-three with room from the top edge; end-of-hand hint just above the bottom row.

## Built — 2026-10-16

Live on main (d626805): L2, Close at the bottom, Three toggle in the picker, stacked options
on PC, G2 dividers, question line and extra diamonds removed, O3 switch, end-of-hand hint
kept. Checked by the Keeper against rounds 2–3 at phone, sideways, PC and forced-wide; tests
37/37. Sent back: forced-wide pick-three text was too small → Keeper's design call: it stacks
like upright pick-three at full size. Twist divider follows round 4; Keeper's call on its
placement: lined up with the text on the left, not centred.

## Twist divider — built 2026-10-18

Round 5: https://claude.ai/artifact/W6dS9zWx7KDNL5EwAhbmB9. Owner picked T1 with the celadon
toned down to T3's intensity → token `--celadon-soft` (celadon mixed toward the background to
`--muted-l`'s lightness). Question-side bar = category colour via the pick-divider source;
left-aligned on phone/PC, vertical and dimmed sideways; old ornament and diamond removed.
Live on main (e626608). Keeper checked it against round 5 T1/T3. Tests: one run 37/39 (fullscreen
end-of-hand star tap; start-screen Three click timeout), the next 39/39 — the builder saw the same
once; looks like timing flakiness in those two checks, not this change.
