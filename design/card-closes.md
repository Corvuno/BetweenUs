# The card closes (end message to Intermezzo)

`deck.js` `endMessageToIntermezzo`, `styles.css` "The card closes". No turn. After the message's
dwell the back comes up over it. All on `--ease-move` `cubic-bezier(.45,0,.25,1)` (slow start,
long soft settle):
- the message fades 450ms;
- the back fades in 500ms;
- the back's own lattice grows in as a ring thickening inward from the card's edges (`closeRing`,
  850ms after 300ms; a `clip-path` ring driven by `@property --p`, 19% / 15% at the end);
- its double frame draws round from the top centre (`closeFrame`, 850ms after 450ms; a conic
  `mask-image` driven by `@property --a`);
- the word INTERMEZZO fades in (`closeWord`, 600ms after 900ms).

The finished back then holds with an empty window (a chosen held beat; keep it) and the pause
mark draws as before, pushed back by `--lead: .85s` (every mark delay is
`calc(var(--lead,0s) + ...)`, 0 everywhere else).

Mechanics: `.mv-build` carries the closing on `#card`; `.mv-keep` keeps the message visible until
the back covers it (removed at 700ms, when `showHandSummary({closing:true})` paints the face);
`clearEndTimers` strips both and `.mv-fade`. Hairlines stay hairlines, no glow, no new ornament.

Spotlight has no back: its message fades the same way and its panel joins the beat
(`.im-wrap.closing`, `--lead:.15s`, word at .2s). A tap during the closing first settles it
(`settleClosing`: class removed, `im-still`, mark finished).

Reduced motion: the back fades in over 600ms to a finished Intermezzo, nothing drawn.
