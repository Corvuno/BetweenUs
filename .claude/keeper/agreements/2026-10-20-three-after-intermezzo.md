# Three after the intermezzo; app updates when it comes back — 2026-10-20

Area: C (how the app works). A and B don't change.

## 1. First card after the intermezzo comes as three (bug)
Owner: with Three on, the first card after the intermezzo is a single card; the rest of the
hand is three. Cause (tester): hold-to-continue (`nextCard` case 'reshuffle') and Draw more
(`drawMore`) build the new hand and call `_nextCardBase()` directly, skipping the Three
decision. Since 2026-10-15.

What changes: with Three on, the first card of a new hand — after hold-to-continue and after
Draw more — goes through the same Three decision as every other step (three options; fewer
only when the selection can't supply two others). Owner OK 2026-10-20.

Stays: the very first card of a session is single (Three is dimmed before the first draw);
everything in the 2026-10-18 and 2026-10-19 Three agreements.

Done when: a test plays a hand through the intermezzo with Three on and finds three options at
step 1 of the next hand (fails before, passes after); same for Draw more; tester repeats the
owner's steps on PC and in Spotlight; reviewer clean.

## 2. The app picks up a new version when it comes back to the front
Owner ran an old copy for a day: the app stays on the code it loaded until a full reload, e.g.
an installed app left open in the background. What changes: when the app comes back to the
front (and on open), it checks for a new version and, if there is one, loads it at a moment that
doesn't interrupt play — never mid-hand with a card on screen in a way that loses the player's
place. Owner OK 2026-10-20 ("sounds logical, do it"). The builder proposes the exact moment in
its look-through; the Keeper decides and reports it.

Done when: a simulated new version is picked up after the app returns to the front, the
player's hand and place survive, and nothing reloads while offline.

## Part 2 decided by the Keeper (2026-10-20, after the builder's look-through)
- Detection: on open and when the app comes back to the front (online only, at most once a
  minute), fetch the page fresh and compare its `?v=` stamp with the running one.
- The reload happens only at a between-hands moment: the start screen before the first draw,
  the end-of-hand screen / Intermezzo / the hand list. Never mid-hand, also not while hidden —
  a mid-hand restore isn't proven, so it isn't risked. A pending version waits for the next such
  moment.
- No prompt to the player; the reload is silent. Never offline, never twice in a row.
- `session.js` is not widened for this.
