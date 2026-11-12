# Spotlight (fullscreen, `#partyOverlay`)

**Rule: Spotlight looks like the main screen unless an agreement says otherwise.** It may be
larger (it is fullscreen), never different in colour, tone, line strength or lettering. Every
element that exists on both screens shares one rule, so a main-screen change carries over. A new
control with a twin on the other screen gets a selector in the twin's rule, not a copy of its
values.

Twins and what they share (main / Spotlight):
- **Buttons.** Spotlight's own buttons (`.party-chrome button`) follow the celadon rule: `--celadon`
  at rest; `--gold` on hover (`@media (hover:hover)` only, so it never sticks on touch), on press
  and on keyboard focus; "on" is an underline under the word (1px, offset 7px) and the colour stays
  celadon; disabled opacity `.32`. Words Jost 400, `.22em`, uppercase. Spotlight keeps its own size
  (12px, 15px on PC) and its arrows stay plain glyphs (no bordered square). The main screen's
  Spotlight and Menu are quiet words (`--btn-quiet`), see `under-card.md`.
- **Close** (`#partyExit`) is the twin of the main Spotlight button (`#btnParty`): same
  square-in-square symbol, celadon. The `Esc` / `T` / `3` key hints are `--muted`, shown on PC only.
- **Three and Twist** have no button in Spotlight: keys 3 and T work, and Twist's sentence still
  shows.
- **Star** `#cardStar` / `#partyStar`: `--gold`, opacity `.18` off, `.65` on hover (mouse only), `1`
  when starred. `updateStarUI()` (card.js) keeps both in step.
- **Twist text** `.twist-sentence.twist` / `.party-number.twist`: Cormorant italic, `--celadon`
  (also its TWIST label in Spotlight).
- **Count**: Poiret One `.22em`, `--gold`; flanking rules `.prog-count-rule` / `.pc-rule::before`
  are one shared rule (gold at 30%, fading outward); only the length differs (44px main, 20px
  Spotlight).
- **Corner markers** `.card::before/::after` / `.party-frame i`: gold at opacity `.35`, size
  scales. Deck marks (After Dark red, Colbert, The 36) come from the same `applyCardMark()`
  (card.js) on both, `var(--mark)` at `.55`. Spotlight's picker corners use the same `.35`.
- **Category label**: Jost 600, tracking `.16em` phone / `.2em` PC (the main label's), size larger
  in Spotlight: fullscreen party-level label 17px phone / 16px PC.
- **Sideways/Upright switch** (Spotlight only): follows the play row: celadon word (Jost 400,
  `.22em`), celadon lines at 42% (the row's rules), gold on press/hover/focus.
- **INTERMEZZO** (`.im-word`) is upright (`font-style:normal`), like the main card's
  `.cb-caption`; it does not inherit the card question's italic.

## Twist divider (`.twist-div`, Spotlight only; replaces the old `.party-ornament`)
The pick-divider flourish (hairline plus a short bar either side). Question-side bar = the card's
category colour (`--pd-a`, set in `updatePartyDisplay`, same source as `.pick-div`); twist-side bar
= `--celadon-soft` (`--pd-b`). Horizontal on phone and PC, starting at the text's left edge,
hairline fading out to the right (190px / 300px PC; bars 32x3 / 44x4). Sideways phone and
forced-wide: vertical between the question and Twist columns, dimmed (`opacity:.65`) like the
vertical pick dividers, question bar left, twist bar right. No diamond.
