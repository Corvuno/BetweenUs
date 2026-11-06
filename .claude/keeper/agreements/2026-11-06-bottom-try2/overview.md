# Overview: what is under the card now, and what each part does

Measured on the live app (412 × 915 and the owner's own iPhone screenshots, 76-card mixed hand).

| Part | What it does | When a player uses it |
|---|---|---|
| Progress ticks | one tick per card; played cards in their category colour, coming ones flat (never spoils what's ahead); a sliding window of ~20 with faded ends on long hands | glanced at now and then |
| Count "52 / 76" | the same progress as a number | glanced at now and then |
| Back (arrow in a box) | previous card — **decided: goes** (swipe right on the card already does it) | rarely |
| NEXT CARD (gold bar) | draws the next card; swiping left on the card does the same | every turn, tens of times an evening |
| Menu (icon in a box) | opens the sheet: The Deck, Start over, Played, Favourites, Ways to play, Show hints again | a few times an evening |
| Three | three cards to choose from — **decided: moves to The Deck** | — |
| Spotlight | shows the question full screen, to show a group or put on the table | now and then |
| Twist | same question, new angle (a modifier on the current card) — **open** | now and then |
| Hints under Three/Spotlight/Twist | first-visit explanation, gone after the first tap | first evening only |

Vision lines it must respect: the screen focuses on the question alone, the controls needed to
play are shown, the rest hidden or layered; never show coming cards; an element exists on phone,
PC and Spotlight alike or not at all; the card is for reading only, keeps a real card's proportions.
Assessment (design-critique + emil-design-eng): no shared look, no hierarchy; the gold bar is the
loudest thing on screen; ~20 category colours sit right under a card that carries one.

## Added for the second check

- **Spotlight's own controls today:** Close, previous/next arrows, Sideways/Upright, the count,
  the star, Three and Twist. So Twist already exists inside Spotlight as well as under the card.
- **Played** (in the Menu): the list of every card drawn this hand, each with its category colour.
  It already holds the same record the coloured ticks show.
- **What each part is for**, worked out:
  - Next card: the one thing every turn needs. Swiping the card does the same, but a visible
    control is needed for first-timers and PC (vision: "the controls needed to play are shown").
  - Progress: pacing ("track progress", owner). It's information, not a control; nobody acts on it
    every turn. The colours add a record of the evening, which Played also holds.
  - Spotlight: a way of showing the card to others. It belongs with the moment of showing, not
    with reading.
  - Menu: a door to the evening's settings and history. Rare, but it needs a visible way in.
  - Twist: a modifier on the current card (open).
  - Hints: explain the controls on the first evening.
