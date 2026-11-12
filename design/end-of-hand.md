# The end of a hand

After the last card of a hand the app shows, in order: the message, the Intermezzo card back, and
(on a tap) the hand's list. All of it follows the colours in `DESIGN-SYSTEM.md`; the only new
colour is the last drawn card's chapter colour, held as `--im-color` on `<body>` (set by
`paintHandSide` in `presentation.js`). Fullscreen shows the same things in its own layout
(`.party-overlay.is-hand-end` / `.is-hand-list`). Under the card, Save takes Spotlight's place
(see `under-card.md`).

## The message after the last card
`.end-msg`, `.party-question.is-end-msg`. Lettered like INTERMEZZO, because that word reads well:
Federo, upright (`font-style:normal`; the card question's italic is off), uppercase,
`letter-spacing:.32em`, `--muted-l`, centred, `line-height:1.6`. Own size (1rem on the card and in
fullscreen); it is not sized to the INTERMEZZO word. Each line is its own block; long lines wrap
inside the card, never overflow; each line carries `padding-left:.32em` so the last letter's
tracking doesn't push it off-centre. Stays up about 1.1s (one line) or 1.9s (two lines), then
the card goes to Intermezzo (see `card-closes.md`). Not thin italic serif or `--muted`: that was
unreadable.

## Intermezzo card back
`.card.is-intermezzo`, fullscreen `.im-wrap`. The pause mark (fermata: two arches and a diamond)
replaces the logo; the caption INTERMEZZO sits under it: Federo, uppercase, `.32em`, `--muted-l`,
upright (`font-style:normal`, like `.cb-caption`, not the card question's italic), size from the
card `calc(var(--d)*.075)` and in fullscreen `clamp(.8rem,.9vw + .4rem,1.2rem)` (`.im-word`).
- The diamond and the rule under the mark are filled with `var(--im-color)` (eases when it
  changes); the rule is a transparent-gold-transparent gradient of that colour.
- The diamond breathes (`imBreathe`, opacity .9 to .45, 3.2s). On arrival the arches draw in, then
  the diamond, then the flanking hairlines (`imDraw` 1.4s, `imFade`). Coming back from the list the
  finished mark shows and only breathes (`.im-still` / `.still`).
- The rule is the mark's reflection: it appears with the diamond (same `imFade`, same delay) and
  breathes in exact step (same 3.2s, delay and easing) with `imEcho`, opacity .9 to .675 (half the
  diamond's dip). Same on the start card (`.cb-rule`) and in Spotlight (`.im-rule`); hidden while
  the mark is drawing or waiting (`.logo-wait`).

## The flip
One shared, slow card turn on its side, for every turn of this card (Intermezzo to list, list back
to Intermezzo). 840ms (`cardTurn`; `cardTurnBack` is the mirror, used turning back to Intermezzo).
`perspective(1600px)` (soft), a dip to `scale(.94)` at the edge, `rotateY` 0 to 90deg, flipping to
-90deg at 50% and back to 0. Eased, not linear: slows into the edge (`cubic-bezier(.45,0,.75,.4)`),
eases out of it (`cubic-bezier(.25,.6,.55,1)`). Edge-on is at 420ms and that is the only moment
the face swaps (JS: `TURN_MID_MS` 420, class removed at `TURN_END_MS` 870, both in `deck.js`;
they follow the CSS). While turning, `.card-back` has `transition:none`, so the lattice back is
there at once at the edge; the `.flipping` text fade is not used for these turns (the edge hides
the swap). Applies to the card and the fullscreen card. Intermezzo flips with a tap; a hold skips
the list. The message to Intermezzo does not use the turn. `.card.flipping` only serves the
end-of-hand message fade.

## Hold/Tap button (`.btn-draw.hold-mode`)
The gold button's size and type, but filled with a gradient of `--im-color` (86% mixed to white
down to 76% mixed to black, 135deg), dark text (`--bg`). Falls back to gold. Words: "Tap to flip
card" on Intermezzo, "Hold to continue" on the list. `.holding` dims it to opacity .72.

## The hand list (`.hd-list`, `.hd-row`)
- Bodoni Moda italic questions in `--cream` (readable, not muted). Size set once per breakpoint
  with `--hd-fs`, as a rule against the card's own question: 1.02rem on phone (card question is 1rem
  or more), 1.3rem from 768px, 1.45rem from 1024px, 1.65rem from 1500px; fullscreen
  `clamp(1.25rem,1.1vw + .95rem,1.8rem)`.
- Everything in a row is sized in `em` from that one value, so diamonds and stars grow with the
  text. A row is a grid of diamond (`.42em`, rotated square, in the card's level (chapter) colour),
  question, star (`1.1em` icon; tap target at least 34px; `--muted` off, `--gold-l` filled when
  on). Rows are spaced `.75em` apart (fullscreen `clamp(10px,1.6vh,22px)`).
- The list scrolls inside the card with no browser scrollbar; its own scroll indicator is a 1px
  gold track (`rgba(201,168,76,.18)`) with a 3px thumb (`rgba(232,201,122,.7)`) down the right
  edge; top and bottom edges fade out with a mask (10px top, 22px bottom) instead of cutting rows
  off. Fewer rows fit at once on purpose: the list scrolls sooner rather than shrink the text.
- The phone card scaling (`card-question-width.md`) deliberately does not scale the list
  (`.is-hand-list`, `.hd-list`): it is text to read and stays at its own size.

## Fullscreen hint line (`.party-end-hint`)
A quiet line just above the bottom row, same words as the phone button. Federo, uppercase,
`.22em`, `--muted`, `.72rem` (`.85rem` from 900px wide); a leading `--gold-l` word marks the
action. It is a hint for a control that is already there, not text to be read for content.

## The start card's logo
Animates like the pause mark: the lines draw in, the diamond fades in and then breathes (same
keyframes), every time that back appears. When a new deck loads from the categories sheet it waits
(`.logo-wait`) until the sheet has fully closed.

## Reduced motion
The flip has no turn; the drawn marks (pause mark and logo) show finished at once, the diamond
stays at opacity .9 without breathing, and the rule under it shows steady at .9; the end message
switches to Intermezzo with no turn, at the same moment.
