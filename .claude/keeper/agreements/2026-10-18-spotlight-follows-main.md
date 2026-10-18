# Spotlight follows the main screen — 2026-10-18

Owner: "the colours need to be updated from main … spotlight and normal screen should be
updated simultaneously, not drift. Check if elements are used in spotlight and make them
integrate with the normal version." Areas: B (looks) and C (how it's built: shared styles).
Based on a read-only audit (2026-10-18): the main screen moved to one chrome system on
10-13/14; Spotlight never followed, and no Spotlight control shares a rule with its twin.
Owner agreed to the Keeper's proposal and decisions in full ("I agree with your suggestions").

## Changes

1. Spotlight takes the main screen's system — colour, lettering and symbols: celadon at
   rest; gold on hover (mouse only, `@media (hover:hover)`) and on press/focus; "on" shown as
   an underline, colour stays celadon (Twist, Three, while picking too); the star as on the
   main screen (gold, dim when off, full when on); twist text celadon like the main card;
   lines, corner markers, count rules and letter-spacing as on the main screen. Spotlight
   may stay larger (fullscreen), never different.
2. One shared style per element that appears on both screens, so a main-screen change
   carries into Spotlight. DESIGN-SYSTEM.md gets the rule: Spotlight follows the main screen
   unless an agreement says otherwise.
3. Bugs fixed in the same pass: the Spotlight star lights when tapped; the Twist symbol (and
   T key hint) shows in Spotlight; deck-mark corner colours (After Dark, Colbert, The 36)
   reach Spotlight; INTERMEZZO upright in Spotlight like on the main screen.
   (Done separately, live: "Three" on the main row in Jost like Twist/Spotlight, e27e0cc.)

## Keeper's decisions (owner agreed)

- Close becomes celadon, like the main screen's Spotlight button (replaces round 1's gold):
  open and close in the same place, looking the same.
- Arrows stay plain arrow glyphs, in celadon — the main screen's bordered back square is not
  copied into Spotlight (a box around one control); that square is a separate topic.
- The Sideways/Upright word follows the play row: celadon word, celadon lines, gold on press.
- End of hand: only the INTERMEZZO slant is fixed here; another thread owns that area and is
  told.

## Stays

Layout (L2), G2 dividers, the O3 switch's place and function, the end-of-hand hint, what
every control does, keyboard keys.

## After

Round 4 (Twist divider) is redone on a new link with the synced colours (the twist side is
celadon now, so "Twist's own gold" changes meaning).

## Done when

Checked by the Keeper side by side, main vs Spotlight, at phone, sideways and PC, in normal
play, picking from three, Twist active and end of hand; tests pass.

## Built — 2026-10-18

Live on main (7fd62f9, merged 8b2c551). Checked by the Keeper side by side (main vs Spotlight)
at phone and PC, Three picking and Twist active; tests 38/38 after merging the latest main.
Builder left small known differences: Twist text weight 400 in Spotlight vs 300 on main;
count rules shorter in Spotlight. Round 4 is superseded by round 5 (same question, live colours).
