# Start card back, round 4: colour on 3 and 5 (#195)

Shown: https://claude.ai/artifact/8uRp3ph3PGowmUCQBTMeey (the live start card on a phone, still and
arriving, each beside the picture it starts from).

Owner on round 3: "I like 2A. It's a good solution to the issue. So we're keeping that one for now."
On 3: "I didn't ask for whatever freaking 3A it has become. Make it more like the shape of 3 is good,
the original 3, not the remakes of 3. The arcing lines, the lines that hit each other of the current
intermezzo card are good. Combine those two. Don't just use the round thing from intermezzo. Don't
figure out a new shape. Use 3, do the same as on the intermezzo thing, and alternate the colors or
play with the colors. Give me a few variants of colors. I don't know. Don't blend them."
On 5: "Yes, this fixes it. Is it a good fix? No. Well, the diamonds are fixed. That's good. [...] The
colors? Really? Putting lines in it? Lazy? As fuck? Do something better. Make a gradient. I don't
know. Blend. Checkerbox. [...] Make a few variants. [...] It's not Sol enough. Sol is okay.
Blatantly, I was too lazy. Not okay. You did find out that I meant the colors and the diamonds not
having their like space. So that's good. I like how you integrated the diamonds. They may have needed
a bit more strength, maybe not." ("Sol" read as "subtle".)

Lesson: a colour change marked with a drawn line reads as a shortcut, not as design. Variations keep
the picked shape exactly; a "variation" that brings in a new shape is not one.

`backs.js` exports (`render.js` lays them over the live app):

- `archedColumns` (3a), `archedTurns` (3b), `archedHalves` (3c), `archedCells` (3d): round 2's arched
  door unchanged, each arch carried on as one arc to the centre line so upper and lower arches cross
  at the sides. Colour: amethyst arches with petrol columns; bands alternating; petrol above, amethyst
  below; only crossing cells in a checker.
- `grainBlend` (5a), `grainRadial` (5b), `grainRings` (5c), `grainChecker` (5d): round 3's grain and
  stronger knots, no seams. Colour: crosswise quarters melting at the joint; petrol at the door to
  amethyst at the frame; rings alternating; sixteen-piece harlequin shifting ring to ring.

The Keeper's verdict with the round: 3b and 5a strongest. Nothing here is chosen.
