# Three, redesigned (+ skip counts as seen) — 2026-10-15

Agreed with the owner 2026-10-15, building on the Three bug report and fixes
(`2026-10-15-three-fixes.md`, which this replaces). Area: C (how the app works). B only where
the three options stop covering Spotlight's controls. A doesn't change.

Owner's idea: "Just keep the current Arc, just give options in that section of the Arc, then
the end screen. … Then it also does not have to return to the start screen." Three is there to
help new players find an easy-to-answer card.

## Three

- Three is a layer on the hand the player chose. Card count (5/10/20/All) and Shuffle stay as
  set. Switching Three on no longer forces All; switching it off never goes back to
  "A place to begin…".
- Arc: every step of the hand shows three cards instead of one, drawn the same way (as random)
  as that step's single card would be, at that step's depth. The player picks one. After the
  hand's last step: the normal end screen.
- Random: three random cards per draw, same rule.
- The two not picked: they sit out the next hand and are shuffled back in from the hand after
  that ("it should have a consequence to choose").
- Switching on: the very next card comes as three. Switching off: the very next card is one
  card at that step. Switching off while three are on screen: one is kept for that step (the
  card the hand had planned there), the other two go back (no choice was made, no consequence).
- "‹ One card" = switching Three off (as above).
- Fixes that come along:
  - Opening/closing Spotlight while three are on screen: the three move along to the screen
    the player goes to (no stuck Next, no card drawn without the three shown).
  - In Spotlight the three no longer cover Close, Next, Back and Twist.
  - Three can be switched off while three are on screen, main screen and Spotlight.
  - The 3 key switches Three off as well as on.
  - Spotlight's end-of-hand message shows a correct number (it read "236.234 new cards left").

## Skip

- A skipped card counts as seen: it doesn't come back until the whole selection is used up and
  a fresh pass starts. It is NOT listed in the history list of cards drawn.

## Done when

Checked in the real page at phone size, main screen and Spotlight: a 5-card Arc hand with Three
on gives 5 picks of three at rising/falling depth then the end screen; switching on/off mid-hand
acts from the next card without a restart; unpicked cards are absent from the next hand and can
return from the one after; skipped cards don't return and don't show in the history;
`node tests/run.mjs between-us.html` passes with new checks for these.

## Added after the first build (owner, 2026-10-15)

- Skip gap: the card that slides in after a skip is treated like any card shown — it counts
  as seen and is listed in the history.
- Start screen: while Three is still on, the Three button stays tappable on the start screen
  and switches Three off. While Three is off it stays dimmed until the first card, as now
  (it can be switched off, not on, before the first draw).
- Builder decisions the owner saw and let stand: end message "That's your N cards." / "M new
  cards left — hold to continue."; already-played steps don't re-offer three; Back with three
  up closes them without a choice; Three switched on at the last card waits for the next hand;
  fewer options when the selection can't supply two extras.
