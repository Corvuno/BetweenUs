# Three: fixes — 2026-10-15

Owner reported: "When selecting Three in Spotlight the first is pick one of three, subsequent
cards are just drawn." A Sonnet tester could not reproduce that directly (Three is a mode
that stays on, on both screens); it found the bugs below. Area: C (how the app works), with
a small B touch (the Spotlight picker no longer covering controls). A doesn't change.

What changes:
1. Switching screens mid-pick: if the three options are on screen and the player opens or
   closes Spotlight before picking, the three options move along to the screen they go to
   (no stuck Next, no card drawn without the three shown).
2. Spotlight: the three options no longer cover Close, Next, Back and Twist; those stay
   tappable while the options are shown.
3. "‹ One card" switches Three off — the same as tapping the Three button off: back to
   "A place to begin…" (owner answered "yes" to "like the Three button does").
4. The garbled number in Spotlight's end-of-hand message ("That's your 236.234 new cards
   left") shows a correct, normal number.
5. Keyboard: the 3 key switches Three off as well as on.
6. Three can be switched off while the three options are on screen, on the main screen and
   in Spotlight.

Stays: switching Three on sets the hand to All; switching it off goes back to "A place to
begin…" (owner: the logical side effect of All; may revisit later).

Done when: each of 1–6 checked in the real page on a phone-size screen, main screen and
Spotlight; `node tests/run.mjs between-us.html` passes with new checks for repeated picks,
Spotlight picks, and switching screens mid-pick.
