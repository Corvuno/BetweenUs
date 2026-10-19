# The pause (Intermezzo) takes the last card's colour — agreement, 2026-10-19

Owner: "the intermezzo icon gets the colour from the last category — people won't get the
chapter as they have no clue what's in them. Also colour is way too much the same. Make a
switch in the menu for me to test this with." Areas: B looks (colour) + C (test switch).

Keeper decisions (named to the owner, overrulable):
- "Last category" = the category of the last card of the hand (the card just before the
  pause). Its colour gets the same legibility lift (labelColor) the chapter colour gets now.
- Everything that now takes the chapter colour at the end of a hand takes it instead: the
  pause diamond, the rule, the rail/--im-color uses, and the Spotlight version. Nothing else.
- Temporary test switch in the main menu, label "Pause colour", sub-line shows the current
  mode ("Last card" / "Chapter"); a tap toggles; stored per device; default "Last card". It is
  a test switch and comes out again once the owner decides.

## Added 2026-10-19 — smooth colour changes
Owner: "When making an animation, make it smooth. It now swaps colour to colour. It should do
smooth transitions." Keeper decisions: every element that takes the pause colour (diamond,
rule, card rail, Spotlight rail, the end-of-hand button gradient) transitions its colour over
~0.6s ease instead of snapping — when the pause appears, when it's left, and when the test switch
flips. Reduced motion: instant. Standing rule added to DESIGN-SYSTEM.md: colour changes in the
chrome are always eased, never a snap.
