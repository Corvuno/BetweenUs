# Between Us — design system reference

Extracted from the app's own stylesheet on 2026-09-23, after a style audit that
found the same visual job — a quiet label, a gold line, a rounded corner —
done a different way almost everywhere it showed up. This file is the answer:
the tidied set of values, what each one replaces, and which parts of the app
those replacements actually reached. Point any future styling work at this
file instead of re-deriving it from scratch.

This does **not** cover category, chapter, or mode colours (World's green,
Romance's rose, the six chapter hues, etc.) — those are deliberately tuned
content colour, not chrome, and are out of scope here on purpose.

## Tokens (all live in `:root` in `styles.css`)

### Lines & borders — 3 tiers, gold only
```
--dim:            rgba(201,168,76,.12)   /* faint — resting hairlines, most borders */
--border:         rgba(201,168,76,.22)   /* normal — card edge, dividers, rails */
--border-strong:  rgba(201,168,76,.38)   /* strong — active/emphasis borders, hover states */
```
Three cream-coloured borders that had drifted off gold (the console divider,
the Shuffle/Cards rail, the fullscreen orientation toggle, plus a handful of
smaller ones found in the same sweep — tooltip, fixed-set option box) now
use these same three tokens. One line colour, three volumes, everywhere.

### Text — reverted, not consolidated
The first pass here folded every "quieter than `--cream`" cream-alpha value
into two shared steps (`--text-dim`/`--text-faint`), and folded `--muted-l`
(`#9c8f7e`, a genuinely *lighter* warm tone) into `--muted` (`#7a6e60`,
darker) as a supposed near-duplicate. Both read visibly darker and lower-
contrast on a real device than they had any right to from the numbers alone
— caught the same day from two independent screenshots ("Selected" and
"Start from" both going close to unreadable) — and were reverted in full.

```
--cream:   #f0e8d8   /* primary — card questions, full-strength labels */
--muted:   #7a6e60   /* quiet warm-brown label, disabled state */
--muted-l: #9c8f7e   /* a step lighter than --muted — its own tone, not --muted's duplicate */
--text-helper: #8c8071   /* helper lines that explain a control or section: The Deck sheet's "Start from" and "Chapters" headings. Between --muted (3.9:1) and --muted-l (6.2:1); 5.1:1 on the dark ground (owner 2026-10-21, helper-text look B). The title subtitle uses --muted-l; "Selected deck · tap to change" stays --muted */
```
Every other cream-alpha text value (help body copy, the sheet heading,
section labels, chapter names off-state, etc.) is back to its original
per-element literal — still not tidied, and that's deliberate now: this
family doesn't get touched again without checking the *rendered* result on
a real screen first, not just a mockup.

### Quiet text-buttons — 1 resting tone
```
--btn-quiet: #8f8171   /* Three, Full Screen, Twist, Change, Save, After Dark,
                           All/None, Explore categories, Categories, ⓘ info,
                           the pick-toggle, limit buttons… */
```
Every plain text-button (no border, goes `--gold` on hover/active) rests at
this one tone now, instead of five unrelated colours (a stark cream at three
different opacities, the `--muted` warm-brown, and a one-off `#9a8259`).
Picked as a midpoint — softer than plain cream, lighter than `--muted` — after
the first pass (flat cream 48%) read as too loud against what was actually
there.

### The gold button — one spec, used three times
`.btn-draw` (Next Card), `.custom-add-btn` (Add to Deck), and `.cat-go-btn`
(Draw Cards) were three separately-typed copies of the same gradient that had
quietly drifted apart: different font-size (12/12.8px), different
letter-spacing (.12/.14em), different padding (14/15px), a different hover
mechanism on one of them (`filter:brightness()` instead of the gradient
lightening), and one with no press feedback at all. All three are now the
same spec — Next Card's, by explicit pick:
```
font-size: .8rem (12.8px)   letter-spacing: .14em   padding: 14px 0
hover: linear-gradient(135deg,#ddb85c,#b08840)   active: scale(.98) (Draw and the square buttons press to .97, see "Motion")
corners: square
```

### Corners — Option B (square controls, one soft radius for containers)
Buttons and the question card stay square — the deck's own shape. Containers
that *hold* content (drawers, the category sheet, the picker) get one soft
radius instead of the eight scattered amounts (1.5/2/3/6/8/12/16/20px) that
were there before. The question card was explicitly asked about and kept
square on purpose — it's styled as a physical playing card (drawn corner
brackets standing in for a card's own edge); drawers are software chrome, a
different kind of object.

### After Dark red — base + highlight
```
--ad-red (base):          #7a1620   /* toggle button active state, chapter row */
--mark-afterdark (highlight): #c1272d   /* card corner marking, category chip/glow */
```
Both tokens already existed and already held these exact values in two of the
four places that used red — only the category chip (was `#ff2f2f`) and the
chapter row (was `#6e1719`) needed to move onto them.

### Frame colours — copper, celadon, preset (added 2026-10-13)
```
--copper:        #C67B28   /* the deck's own frame: the logo's centre diamond only (no longer Custom) */
--celadon:       #A9C7B6   /* everything you can tap besides Draw: Three, Full screen, Twist, their rules/separators, Twist's line on the card, and the back and menu symbols */
  /* also marks the chosen option in a choice row: Shuffle (Arc/Random) and Cards (5/10/20/All) in the categories sheet */
--celadon-hint:  #5b6b63   /* the sub-lines in the main menu (its labels are celadon, icons stay gold) */
--row-hint:      #6f8579   /* the hint lines under Three / Spotlight / Twist (`.row-hint`): one step lighter than --celadon-hint (3.5:1 → 4.9:1 on the dark ground) so they read on a phone; 15px (.95rem), max-width 112px so they fit under each label at 360px. PC hover hints use --celadon, unchanged */
--preset:        (set from renderShell) /* which edition: logo's inner line pairs, preset name. Strangers #8fd14f, Family #ee7a35 (--mc in styles.css) */
--preset-a/-b:  (set from renderShell, Custom with 2+ categories only) /* first and second picked category colour: the logo's inner line pairs split left/right (gradient #trP) */
--preset-deep:   (set from renderShell) /* the preset a shade deeper (same hue/saturation, lightness -7 points, floor 45%, already-darker colours unchanged): for filled areas, i.e. the start-card diamond and its rule, which read paler than thin letters */
```
One job each. Gold stays "draw" (Next Card, borders at the three tiers; back/menu
frames rest at rgba(201,168,76,.2) and turn gold with their symbol on hover, press and
keyboard focus). Copper is only the logo's centre diamond. The preset colour says
which edition is selected and falls back to `--gold`. "Custom" (no preset button
matched) wears the colours of the selected, playable categories in CATEGORIES order
(`customPicks` in presentation.js): one category = that colour everywhere, still; two or
more = up to 3 "shown" colours are chosen (`shownPicks`: the pick furthest in Lab from gold first, then each furthest from those chosen, kept in CATEGORIES order, so many warm picks never read gold); the logo line pairs split between the first two of them, the preset name a soft left-to-right gradient of the shown colours (never more than three, `.tok-multi`/`--tokg`; clipped text), `--preset` and `--tokc` the first shown colour (never an average), and the start card's diamond and rule (`--preset-deep`
on #card) step through ALL picks starting at the first shown colour, switching at the faint point of each breath (one Web
Animation locked to the diamond's breath, no timers; cancelled when the start card leaves;
reduced motion = first colour, still). The top logo never animates. Reason: Custom is the
one the player made, so it shows. Celadon is the colour
of everything tappable besides Draw; back and menu are celadon at rest and gold
while touched (the hover rule is scoped to `@media (hover:hover)` so it never sticks on touch).

## Colour changes are eased (standing rule, owner 2026-10-19)
Colour and state changes in the chrome are always eased, **~0.4-0.6s** (`ease`), never a snap.
Instant only under `prefers-reduced-motion:reduce`. Any new element that changes colour follows it.
Gradients and `color-mix()` cannot transition on their own, so build them from registered custom
properties (`@property`, syntax `<color>`) and put the `transition` on those properties:
- `--im-color` (inherits, initial gold): the pause colour on `<body>`; `body{transition:--im-color .6s ease}`
  so the diamond, the rule and the Spotlight copies, all reading `var(--im-color)`, follow it.
- `--rail-d` / `--rail-m` / `--rail-l` (initial transparent): the three stops of a rail's five-stop
  gilt sweep. `.c-accent`, `.party-c-accent` and the chapter rows (`--ch-rail`, composed in CSS from them)
  draw the gradient from them; the first two transition them;
  set them with `giltRailPaint(el, hex)` in `gilt.js`, never with an inline `background`.
- `--bd-a` / `--bd-b` (initial = the gold button's two stops): the gold button's gradient;
  `.btn-draw` transitions them (hover and the end-of-hand colour set them, not `background`).
  Hover answers in .2s (the `:hover` rule carries its own `transition:all .2s`; a transition runs with the
  style it moves to, so only the way in is quick). At the end of a hand the stops derive from `--im-target`
  (the pause colour, set without easing next to `--im-color`), never from the eased `--im-color`: reading
  that would ease the button twice and lag it ~.5s behind the diamond.
Reduced motion: one rule at the end of `styles.css` sets `transition:none` on all of these.

## The end of a hand (added 2026-10-16; built 2026-10-15/16)
After the last card of a hand the app shows, in order: the message, the Intermezzo
card back, and (on a tap) the hand's list. All of it follows the colours above; the
only new colour is the last drawn card's chapter colour, held as `--im-color` on
`<body>` (set by `paintHandSide` in `presentation.js`). Fullscreen shows the same
things in its own layout (`.party-overlay.is-hand-end` / `.is-hand-list`).

**Readability rule (owner, 2026-10-16, said twice).** Text a player has to read is
never set as quiet, muted small print. Size it against the nearest comparable text
on the card, and check it at real phone size (390x844). A layout never shrinks such
text to fit; it changes the arrangement instead (wrap, stack, scroll).

**The message after the last card** (`.end-msg`, `.party-question.is-end-msg`):
lettered like INTERMEZZO, because that word reads well. Federo, upright (`font-style:normal`
— the card question's italic is switched off), uppercase, `letter-spacing:.32em`, colour
`--muted-l`, centred, `line-height:1.6`. It keeps its own size (1rem on the card and in
fullscreen); it is *not* sized to the INTERMEZZO word. Each line is its own block;
long lines wrap inside the card, never overflow; each line carries `padding-left:.32em`
so the last letter's tracking doesn't push it off-centre. Stays up ~1.1s (one line) or ~1.9s (two lines), then the card turns over into Intermezzo (no fade; see The flip).
Earlier look (thin italic serif, `--muted`) was unreadable and is gone.

**Intermezzo card back** (`.card.is-intermezzo`, fullscreen `.im-wrap`): the pause mark
(fermata, two arches and a diamond) replaces the logo; the caption INTERMEZZO sits under
it — Federo, uppercase, `.32em` tracking, `--muted-l`, size from the card (`calc(var(--d)*.075)`)
and in fullscreen `clamp(.8rem,.9vw + .4rem,1.2rem)` (`.im-word`). The diamond and the
rule under the mark are filled with `var(--im-color)` (registered, initial gold; eases when it changes); the rule is a
transparent-gold-transparent gradient of that colour. The diamond breathes
(`imBreathe`, opacity .9 to .45, 3.2s). On arrival the arches draw in, then the diamond,
then the flanking hairlines (`imDraw` 1.4s, `imFade`); coming back from the list the
finished mark shows and only breathes (`.im-still` / `.still`).
The rule under the mark is its reflection: it appears with the diamond (same `imFade`, same
delay) and breathes in exact step (same 3.2s, same delay, same easing) with `imEcho`, opacity
.9 to .675 (half the diamond's dip). Same on the start card (`.cb-rule`) and in Spotlight
(`.im-rule`); hidden while the mark is drawing or waiting (`.logo-wait`).

**The flip**: one shared, slow card turn on its side, for every turn of this card (message to
Intermezzo, Intermezzo to list, list back to Intermezzo). 0.9s total (`cardTurn`; `cardTurnBack`
is the mirror, used turning back to Intermezzo). `perspective(1600px)` (soft), a dip to
`scale(.94)` at the edge, `rotateY` 0 to 90deg, flipping to -90deg at 50% and back to 0. The
curve is eased, not linear: slows into the edge (`cubic-bezier(.45,0,.75,.4)`), eases out of it
(`cubic-bezier(.25,.6,.55,1)`). Edge-on is at 450ms and that is the only moment the face
swaps (JS: `TURN_MID_MS` 450, class removed at `TURN_END_MS` 940, both in `deck.js`). While
turning, `.card-back` has `transition:none`, so the lattice back is there at once at the edge
instead of fading in; the `.flipping` text fade is not used for these turns (the edge hides the
swap). Applies to the card and the fullscreen card. Intermezzo flips with a tap; a hold skips
the list. Earlier look (0.35s, `perspective(1100px)`, edge at 175ms, no size dip) is gone.

**Hold/Tap button at hand end** (`.btn-draw.hold-mode`): the gold button's size and type
(`letter-spacing:.1em`), but filled with a gradient of `--im-color` (86% mixed to white
down to 76% mixed to black, 135deg), dark text (`--bg`). Falls back to gold. Words: "Tap to
flip card" on Intermezzo, "Hold to continue" on the list.

**Play row words** (`#screenRow` `.row-lbl`: Three, Spotlight, Twist, Change, Save): all Jost, 400, `.72rem`, `.22em`, uppercase, as the row sets. Three's word used to render in Federo because the Federo label rule listed `.pick-toggle span`; that selector is gone so the row's own type applies (owner, 2026-10-18).

**Change / Save at hand end** (`#handActionsRow`, swapped in for `#screenRow` via
`body.showing-hand-summary`): the same row as Three / Spotlight / Twist, not a copy of it.
The `#screenRow` rules in styles.css ("The play-style row") list `#handActionsRow` as a
second selector, so rules above and below, `--celadon` capitals (Jost, `.72rem`, `.22em`),
17px icon, gold on hover/press and the italic `.row-hint` line (`--row-hint`) are one
definition. Markup is the same pattern: `button > .row-top (svg + .row-lbl)` then
`.row-hint`. Two items, no separator diamond. Icons: 24x24 viewBox, `fill:none`, stroke
`currentColor` 1.7, miter, butt (as Twist).
- Change: a deco dial — outer arc, inner arc at `.55` opacity, base line, needle ending in a
  filled diamond. (It opens the category sheet, which sets which questions are drawn.)
- Save: two stacked chevrons over a line.
Hints (owner's words, lowercase): Change "set which questions are drawn"; Save follows the
device's local time when the end-of-hand row is shown — 05:00-11:59 "take this morning with
you", 12:00-17:59 "take this afternoon with you", 18:00-23:59 "take this evening with you",
00:00-04:59 "take tonight with you" (set in `renderHandSide`, presentation.js). Both hints
retire the first time their button is used, like the others: `HINTS` entries `change` and
`save` in state.js, body classes `hint-change-taught` / `hint-save-taught`, and "Show hints
again" brings them back. Fullscreen has no Change/Save, so none there.

**The hand list** (`.hd-list`, `.hd-row`): Bodoni Moda italic questions in `--cream`
(readable, not muted). Size is set once per breakpoint with `--hd-fs`, as a rule against
the card's own question: 1.02rem on phone (card question is 1rem or more), 1.3rem from 768px,
1.45rem from 1024px, 1.65rem from 1500px; fullscreen `clamp(1.25rem,1.1vw + .95rem,1.8rem)`.
Everything in a row is sized in `em` from that one value, so diamonds and stars grow with
the text: a row is a grid of diamond (`.42em`, rotated square, in the card's level (chapter)
colour), question, star (`1.1em` icon; a tap target of at least 34px;
`--muted` off, `--gold-l` filled when on). Rows are spaced `.75em` apart (fullscreen
`clamp(10px,1.6vh,22px)`). The list scrolls inside the card with no browser scrollbar; its
own scroll indicator is a 1px gold track (`rgba(201,168,76,.18)`) with a 3px thumb
(`rgba(232,201,122,.7)`) down the right edge; top and bottom edges fade out with a
mask (10px top, 22px bottom) instead of cutting rows off. Fewer rows fit at once on
purpose; the list scrolls sooner rather than shrink the text.

**Fullscreen hint line** (`.party-end-hint`): a quiet line just above the bottom row,
same words as the phone button. Federo, uppercase, `.22em`, `--muted`, `.72rem`
(`.85rem` from 900px wide); a leading gold-light word marks the action (`--gold-l`).
It is a hint for a control that is already there, not text to be read for content.

**The start card's logo** animates like the pause mark: the lines draw in, the diamond
fades in and then breathes (same keyframes), every time that back appears. When a new
deck loads from the categories sheet it waits (`.logo-wait`) until the sheet has fully closed.

**Reduced motion** (`prefers-reduced-motion:reduce`): the flip has no turn; the drawn
marks (pause mark and logo) show finished at once, the diamond stays at opacity .9
without breathing, and the rule under it shows steady at .9; the end message switches to Intermezzo with no turn, at the same moment.

## Spotlight follows the main screen (owner, 2026-10-18)

**Rule: Spotlight (fullscreen, `#partyOverlay`) looks like the main screen unless an agreement says
otherwise.** It may be larger (it is fullscreen), never different in colour, tone, line strength or
lettering. Every element that exists on both screens shares one rule, so a main-screen change carries
over. A new control that has a twin on the other screen gets a selector in the twin's rule, not a copy of
its values.

Twins and what they share (main / Spotlight):
- Play-row words and the back/next arrows (`#screenRow` buttons, `.nav-row` / `.party-chrome button`):
  `--celadon` at rest; `--gold` on hover (`@media (hover:hover)` only, so it never sticks on touch), on press
  and on keyboard focus; "on" (Three, Twist) is an underline under the word (1px, offset 7px) and the colour
  stays celadon; disabled opacity `.32`. Words Jost 400, `.22em`, uppercase. Spotlight keeps its own size
  (12px, 15px on PC) and its arrows stay plain glyphs (no bordered square).
- Close (`#partyExit`) is the twin of the main Spotlight button (`#btnParty`): same square-in-square symbol,
  celadon. The `Esc` / `T` / `3` key hints are `--muted`, shown on PC only.
- Three: same three-card symbol and word as `#pickToggle`; Twist: same square-and-diamond symbol. The Twist word
  sits in `.row-lbl.tt-label`, so `renderTwist()` rewrites only the word, never the symbol or key hint.
- Star: `#cardStar` / `#partyStar`: `--gold`, opacity `.18` off, `.65` on hover (mouse only), `1` when starred.
  `updateStarUI()` (card.js) keeps both in step.
- Twist text: `.twist-sentence.twist` / `.party-number.twist` Cormorant italic, `--celadon` (also its
  TWIST label in Spotlight). The divider between question and Twist text is the Twist divider (below).
- Twist divider (`.twist-div`, Spotlight only; replaces the old `.party-ornament`): the pick-divider flourish (hairline plus a short
  bar either side). Question-side bar = the card's category colour (`--pd-a`, set in `updatePartyDisplay`, the same source as
  `.pick-div`); twist-side bar = `--celadon-soft` (`--pd-b`). Horizontal on phone and PC, starting at the text's left edge, hairline
  fading out to the right (190px / 300px PC; bars 32x3 / 44x4). Sideways phone and forced-wide: vertical between the question and
  Twist columns, dimmed (`opacity:.65`) like the vertical pick dividers, question bar left, twist bar right. No diamond.
- Count: Poiret One `.22em`, `--gold`; flanking rules `.prog-count-rule` / `.pc-rule::before` are one shared
  rule (gold at 30%, fading outward); only the length differs (44px main, 20px Spotlight).
- Corner markers: `.card::before/::after` / `.party-frame i`: gold at opacity `.35`, size scales. Deck marks
  (After Dark red, Colbert, The 36) come from the same `applyCardMark()` (card.js) on both, `var(--mark)` at `.55`.
  Spotlight's picker corners use the same `.35`.
- Category label: Jost 600, tracking `.16em` phone / `.2em` PC (the main label's), size larger in Spotlight.
- Sideways/Upright switch (Spotlight only): follows the play row: celadon word (Jost 400, `.22em`), celadon lines
  at 42% (the row's rules), gold on press/hover/focus.
- INTERMEZZO (`.im-word`) is upright (`font-style:normal`), like the main card's `.cb-caption`; it does not
  inherit the card question's italic.

## Tokens added
- `--celadon-soft`: `color-mix(in srgb, var(--celadon) 74%, var(--bg))` = rgb(129,150,137). Celadon pulled toward the background until its
  luminance (0.284) matches `--muted-l` (0.282): a celadon with the weight of the quiet neutral, for small accent bars (owner 2026-10-18: "a bit
  less lightness, so it sits more at T3 in terms of intensity"). Used by the Twist divider's twist-side bar.

## What's fixed everywhere vs. what's scoped

**Fixed file-wide:** the line/border tokens (§ Lines & borders), the quiet-
button tone, the gold button unification, the corner-radius rule, the After
Dark red mapping, and three labels that were silently rendering in Arial
instead of Jost (`.ch-desc`, `.cbk-chev`, `#dLangIcon` — they're `<span>`s
inside a `<button>`, and browsers don't let form controls inherit page font
by default). The text-colour consolidation (§ Text) was attempted, found to
regress contrast, and reverted the same day — see that section.

**Scoped to what was actually reviewed, not swept file-wide:** font sizes and
letter-spacing. The audit page showed a *sample* — 11 sans sizes, 9 serif
sizes, 10 letter-spacing amounts, all drawn from the phone-width screens that
were actually screenshotted. The real file has more distinct values than
that once every rule is counted (including ones on the unused, dormant
"end-of-set" screen still sitting in the CSS). Rather than guess a mapping
for values nobody looked at, only the exact examples shown and approved were
changed:
- the "EN" language icon (was an inline `8px`, now `11px`)
- the fullscreen party-level label (was `10px`/`.3em` tracking; it is now 17px phone / 16px PC at `.16em` phone / `.2em` PC, tracking as the main card label; see "Spotlight follows the main screen")
- the card-level label on phone (was `15.36px`, now `16px`)
- the `I / V` progress counter (was `13px`, now `14px`, per the explicit "bump it a bit" note)

If you want the rest of the size/letter-spacing scale tidied too, that needs
its own pass — a full value inventory shown before it's applied, same as this
one, not a blind sed across the file.

## Where the values live
- `styles.css` `:root` — every token above
- `config.js` — category/chapter colour tables (untouched) and the two
  After Dark reds that now point at the shared tokens' values
- `between-us.html` — the one remaining inline style (`#dLangIcon`)

## The evening chooser (added 2026-10-18)
The sheet "What kind of evening?": Start from (ten presets, as before), a Chapters heading with
None, six chapter rows that unfold in place, Fixed Sets as the last row, Shuffle and Cards on one
line, Draw Cards fixed. Chapter and category colours stay content colour, set from `config.js`.

- **Chapter row** (`.chapter`, 65px): one continuous left line (3px) down the whole row, as in
  the app before. Off: `--dim` line, no tint. Fully on: the gilt sweep (`--ch-rail`, now painted by
  a `::before` over the 3px border so it can fade; it was a `border-image`), row tint `--ch` 9%, name
  in the chapter colour. Partly on (`.part`, reworked 2026-10-20 because it read too close to off):
  a flat line of the chapter colour 70% into `--dim`, row tint 6.5%, name `--ch` 70% into `--muted`,
  count "n / total" in `--ch`; measured halfway between off and on. Names carry **no glow**.
  The row is one tap target (name button stretched over it) that switches the chapter.
- **Chapters change gently** (2026-10-20): tint, line, name and count colour ease over `--ch-ease`
  (.4s ease-out, a local variable on `.chapter`); only rows whose state class changed move. A count's
  number simply changes (no fade; the owner found a fading count annoying). A chapter
  a preset hides (`.chapter-group.ch-hidden`) fades and collapses (`max-height` to 0, opacity,
  the 4px gap) instead of disappearing at once. No glow, flash or extra colour. With
  `prefers-reduced-motion` every one of these is instant.
- **Fold target** (`.ch-fold`, right of the row, 60px wide): the count "n / total" in `--muted-l`
  (`--cream` when partly on) over a celadon chevron, 7px apart, set off from the row by a 1px
  `--border` hairline inset 14px top and bottom. No box, no outline. The chevron turns over when
  open. Reason: the count says the state, the chevron says "opens", the hairline separates the
  fold from the switch without a container.
- **Panel** (`.chapter-panel`, the unfolded categories): left line 3px in the chapter colour at 40%
  (`--ch` is set on `.chapter-group` by `ui.js` for this), `--dim` on the other sides, tint `--ch`
  3%. Each category is a 44px tap target.
- **Category chip marks**: see "The one picked look" below (superseded 2026-10-19: the cream word and
  hollow ring are gone).
- **Fixed Sets** (`.ch-fold--row`, 49px): the whole row is the fold. Name in `.68` cream, hint in
  `--muted-l`, a 1px `--border` hairline (inset 10px) and a celadon chevron in a 60px cell on the
  right. Inside, Colbert and The 36 are built exactly like category items (same dot, word, 44px height,
  padding), in a panel padded like a chapter panel, so they start at the same left edge.
- **None and Open all** (`#deselectAll`, `#foldAll`, at the Chapters heading, right): one quiet pair,
  both in the `.deselect-btn` style (`--btn-quiet`, .75rem, caps, hover gold), a faint middle dot
  (opacity .4) between them, the pair's right edge level with the chapter rows. "Open all" reads
  "Close all" once every shown chapter is open. There is no All here.
- **Shuffle and Cards** (`.seg-row`): two lines, labels SHUFFLE and CARDS in the same row-label
  style as FIXED SETS (`.82rem`, `.09em`, caps, cream .68; no Federo). The label starts at the
  chapter-name inset (16px) and has a fixed 5.5rem column so the choices of both lines align. The
  choices are picked items (celadon word and dot), 48px tall, no boxes. The spice mark's "on"
  state is colour only (no glow).

### The one picked look (owner, 2026-10-19)
`.cat-area :is(.mode-btn,.toggle-btn,.shuffle-toggle-opt,.limit-btn)`: presets, categories in open
chapters, Colbert, The 36, Shuffle and Cards all pick the same way. Reason: the owner liked how the
presets read picked / not picked and wanted one look for everything pickable.
- A 5px dot, then the word (`--pick-size` .8rem, .85rem from 1024px; Jost 300, .09em, caps), 7px
  apart, `0 9px` padding. Not picked: word is the item colour mixed 42% into cream .5, dot at .5
  opacity. Picked: full word colour, dot at full opacity, 1px underline (.7 opacity) 1em under the
  text centre, inset 9px. No glow, no box, no ring, no outline.
- Variables per item: `--pc` the item's own colour (dot; set per kind: `--mc` presets, `--c`
  categories, `--list-col` fixed sets, `--celadon` Shuffle/Cards), `--tc` the word and underline
  colour (default `--pc`), `--pick-h` tap height (presets 49px, categories and fixed sets 44px,
  Shuffle/Cards 48px).
- **Lightened word colours (text only, this sheet only, owner-approved).** Too dark to read as small
  text (below 4.5:1 on the sheet colour #161310), so `--tc` is a lighter version of the same hue:
  World #3b8c68 (real #2d6a4f), Roots #9f7755 (#866448), Deep #6979c3 (#4e60b8), Raw #008b9d
  (#008495), Shadow #837899 (#615874), Us: Intimate #cd5861 (#a13039), Flesh #c45b81 (#832f4d),
  Carnal #db4b52 (#8d1c22), Bare #dc3b96 (#b52074), Kink #ce4d9e (#742055), Close friends preset
  #8875aa (#75609c). The dot, chapter lines, cards and everything outside the sheet keep the real
  colours; `config.js` is unchanged. The dimmed (not picked) state of these sits at about 4.2 to
  4.6:1, by design quieter than picked.

## The Deck sheet heading (added 2026-10-19)
The evening chooser sheet (`#cat-area`, aria-label "The Deck") is named **The Deck**: a
`.drawer-title` (the same heading every drawer and panel uses: Jost, uppercase, `.16em`
tracking, `--gold`, centred; .75rem, .85rem from 1024px, .9rem from 1180px) with
`.cat-sheet-name` (6px under it, no other value). The time-of-day question
(`#playLeadFirst`, "What kind of evening?", set by `updateTimeOfDayHeading`) stays as the
line directly under it, in its existing quieter tone (cream at .6, Federo, sentence case).
Close (✕) is unchanged. No new box, line or glow. Reason: the sheet had no name, only a
question. The card screen's label reads "Selected deck" (was "Selected"); the
" · tap to change" / "click to change" hint is unchanged.

## Motion (added 2026-10-21, animation fixes)

Two curves, defined once on `:root`: `--ease-out: cubic-bezier(.23,1,.32,1)` (things that enter or
respond: starts fast, settles soft) and `--ease-sheet: cubic-bezier(.32,.72,0,1)` (drawers and sheets
sliding in). Plain `ease` / `ease-in-out` are not used for entering things.
- **First draw of a hand:** one 520ms landing (`cardDrawIn`, single keyframe segment on `--ease-out`,
  no bounce); two ghosts ease-out, delays 0 and 60ms; the question swaps in at 310ms (card.js
  `DRAW_TIMING`) so its fade overlaps the landing. Reduce motion: no drop, no ghosts, a 250ms opacity
  fade, swap at 150ms.
- **The turn** (message to Intermezzo, to the hand list, and back): 560ms, edge-on and face swap at 280ms
  (`TURN_MID_MS` / `TURN_END_MS` in deck.js follow the CSS).
- **Drawers, sub-drawer, The Deck sheet, scrims:** open 320ms on `--ease-sheet`, close 210ms; the base
  selector carries the close timing, `.open` the open timing. Desktop modals: open 280ms `--ease-out`,
  close 200ms ease-out, opacity 200ms.
- **Fold-outs:** chapter panels open 260ms / close 200ms on `--ease-out` (ui.js `slideFold`); a chapter
  hiding under a preset the same pair. (`.tray` and the Start-from preset host carry the same pair but
  do not animate today: no `.tray` element exists and the preset host is always open.)
- **Entrance:** header, card, controls, party overlay, party chrome and the token hint use `--ease-out`
  at about 340-380ms; the stagger (header 100ms, card 50ms, controls 200ms) stays.
- **Buttons never use `transition: all`:** name the properties. Draw's gold (`--bd-a/--bd-b`) moves in
  .2s like the rest of the button; only the end-of-hand colour (`.hold-mode`) eases in .6s. Draw and the
  square buttons press in with `:active{transform:scale(.97)}`, 160ms `--ease-out`.
- **Hover is only for real hover devices:** every `:hover` rule sits in
  `@media (hover:hover) and (pointer:fine)` so nothing stays lit after a phone tap. Keyboard
  `:focus-visible` styles are separate and unchanged.
- **Question text** balances its lines (`text-wrap:balance`) on the card, in Spotlight, and Three
  uses `pretty`; the font size is never touched by wrapping. The hand list stays normal wrapping.

## Side rails and chapter rails on wide screens (added 2026-10-21)
`gilt.js` switches every rail to its intense stops from 1024px; the phone's rails are untouched by all of this.
- **Chapter rows, 1024px and up**: the sheen's centre stop is `--rail-l` 70% into `--rail-m`
  (`color-mix(in oklab)`), a pinch back from the near-white intense stop; ends, width (3px), colours, tint all
  as before. The same pull-back the card's top line got, gentler because the line is only 3px. The rule sits in
  its own `@media(min-width:1024px)` next to the chapter rules' end of file; if `giltStopsIntense` changes, look here.
- **Three and Spotlight's pick-three rails** (`.card-area .pick-opt-text::before`, `.party-picker .pick-opt-text::before`),
  in the WIDE SCREENS query: 5px wide (the phone's is 3px beside text a fifth the size), a vertical sweep
  dark (`--pc-solid` 60% into black) → `--pc-solid` at 30% → sheen (`--pc-solid` 62% into white) at 50% → back,
  plus a crisp 1px lit edge (the sheen colour) down the left, for a rolled-metal edge. No glow, no blur.
  The same top and bottom fade mask as on the phone. Built from `--pc-solid`, which `openPicker()` sets per option,
  so it follows every category colour without new stored values.
- **The Deck on a mouse** (`min-width:1024px`, `hover:hover`, `pointer:fine`): every pick in the sheet
  (presets, who's here, categories, dials) is 38px high (`--pick-h`) instead of the touch 44-49px, so the
  presets no longer take a third of the sheet and push Chapters below the fold. Touch devices and the phone keep 44-49px.
