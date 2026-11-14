# Text sets, round 1: tight and loose (#148)

Shown: https://claude.ai/artifact/VEd118iChdAT7UG21bMiYq (the live app three ways: now, tight,
loose; one switch flips every picture in place). Nothing here is chosen.

Owner before the round: "Main issue is the sizes and colours that are all over the place." "I can
see that there is little coherence. And that bothers me." On the typefaces: "The question text is
important to have its own font. I like this one. And there needs to be a reable font as well. The
federo was Introduced to make some things stand out more." On Federo leaving the quiet lines:
"Show me the change and lets see." On how tight: "Show me both, i can't say yes or no without
seeing that." On whether colours means the text tones or also the gold and the greens: "Both. It
became to much."

"Now" is `main` with round 2 of the weight work laid over it (`../2026-11-14-weight-r2/mid.css`,
`body.hv`), because "Small words a step firmer, and a metal line on The Deck and the menu" (#176)
was being built while this round was drawn.

`snap.mjs` holds both sets as rules laid over the live page; `shoot.mjs` takes the pictures with
`harness.mjs`; `type-sets.html` is the page.

- **Tight:** six sizes (12, 13, 15, 17, 19, 21), every size moves up to the next step; capitals
  spaced .1, .16 or .24; five creams and browns; one gold on words; one green, and the green
  explaining lines turn brown.
- **Loose:** ten sizes (today's main ones, near-twins folded in); five spacings for capitals;
  seven creams and browns; both golds; the green keeps one softer partner.
- **Both:** Federo leaves the quiet lines (`.tok-lbl`, `.tok-hint`, `.ch-desc`, `.cat-line`,
  `.menu-act`, the saved-hand details, the menu's foot buttons) for Jost; the default-font lines
  get Jost; the faint words, the close cross and the empty star become readable. The question,
  the title, the name on the card, "INTERMEZZO", the end message, weights, the Draw button and
  every category and chapter colour are left alone.
- **Measured** on the start, a card, The Deck, the menu, Spotlight, the end of a hand, Ways to
  play and Played, phone and computer: sizes 21 / 6 / 10, spacings 13 / 6 / 8, creams and browns
  12 / 5 / 7, golds on words 4 / 1 / 2, greens 5 / 1 / 2, kinds of text 39 / 20 / 28
  (now / tight / loose). No text smaller or darker in either set. "tap to change" goes from 3.7
  to 4.8 to 1; the menu's "Change" from 3.3 to 5.9 (tight) and 5.8 (loose).
- **Seen in the pictures:** tight wraps The Deck's row of decks one line more on a phone and
  makes the hint under the card and the reading text in Ways to play a step larger.
- **Not checked:** After Dark, Three, Twist, a very long question.
