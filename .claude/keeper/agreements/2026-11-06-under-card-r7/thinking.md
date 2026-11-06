# Under the card: back to the fundamentals before round 7 (#113)

Owner after round 6 (2026-11-06): "A and B are again just variations… D is unusable as it has no
controls… menu layers have never been a hit, especially if they have no reason to be layered… C is just
plain ugly. Still moving things around… still the same icons, still the same colour, still the same
element, just a different varnish… not a fundamental 'what does it do, how does it work and what does
the player interact with'." On Three and Twist: "the point was that YOU had to figure this out by
thinking it through." Two rounds missed in a row: stop producing, talk (SKILL.md).

## What happens at the table
- A question is read, then people talk for minutes; one touch every few minutes, between conversations.
- One person usually holds the phone and acts for everyone; the others see only the question
  (Spotlight, held up, on the table, a screenshot in WhatsApp).
- The phone stands in for a physical deck: you handle things, you don't press buttons.

## What each control really is
- Next Card: drawing from the deck.
- Three: a way of drawing (take three, keep one), set for the evening. The Deck already holds the other
  "how the cards come" settings (Shuffle order, Cards per hand); Three belongs there, its state visible
  at the draw. Tension: vision "Three belongs right next to the draw" — asked.
- Twist: in code (card.js pickTwist) a random draw from a pool of twist lines laid on the question, i.e.
  a second small deck. Players in October didn't see what Twist did; a twist card laid on the question
  shows it. Asked whether that matches the owner's meaning.
- Spotlight: showing the card to others; an explicit control (used often, nothing physical to handle).
- Back: taking a card back from the played pile; swipe only.
- Count: how thick the deck still is; belongs with the deck.
- Menu: the box the deck came in (which deck, rules, kept cards, played, put everything back); a real
  group, stays one layer; only its handle's place is open.

## Proposed models for round 7 (each a different answer to "what does the player handle")
1. Objects on the table: the question deck (draw; size = count; Three mark) and the small twist deck;
   Spotlight the one plain control.
2. The reader's hand: built for one person reading aloud; one large draw area under the thumb,
   Spotlight the only other control, the rest appears when the reader stops on a card.
3. Quiet until touched: while people talk only the question and the count show; a touch on the lower
   half brings the controls up, they sink away again.

## Design-gate verdict on the three models (2026-11-06): BLOCK
The models were sent to the owner before the gate existed; the gate (run from
.claude/agents/design-gate.md) blocked them afterwards:
- Models 2 and 3 are one idea (hide most controls, show them when needed); only the trigger differs.
- Model 3 hides the draw, against the vision ("You open it and draw"; "the controls needed to play are shown").
- Model 1 puts the twist deck under the card, against the owner's "Three and Twist leave this space".
- Hints have no place in any model; "stops on a card" in model 2 means nothing (players stop on every card).
- Written as fact above but NOT decided: Back as a swipe only, Menu as one layer, Three's setting in
  The Deck. These are Keeper proposals (see decided.md).
Questions 1 and 2 to the owner passed (taste and meaning). Question 3 passed only with the Keeper's own
verdict added. The models get reworked after the owner's answer to question 1, and go through the gate
again before the owner sees them.
