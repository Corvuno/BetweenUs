# Between Us — design system

What applies everywhere. Where this file and `styles.css` disagree, `styles.css` wins.
Per-screen explanations are in `design/` (index at the end). Category, chapter and mode colours
(World's green, Romance's rose, the six chapter hues) are content colour, not chrome, and are
outside this file. Tokens live in `:root` in `styles.css`; `categories.js` holds the category and
chapter colour tables and the two After Dark reds; `between-us.html` holds the one inline style
(`#dLangIcon`).

## Tokens (all in `:root` in `styles.css` unless marked)

### Ground and gold
| Token | Value | For |
|---|---|---|
| `--bg` / `--surface` / `--card-bg` | #0e0c0a / #161310 / #1a1612 | page / sheets and panels / card |
| `--gold` / `--gold-l` | #c9a84c / #e8c97a | "draw", borders, hover; light gold (filled star) |
| `--cream` | #f0e8d8 | primary text: card questions, full-strength labels |

### Lines and borders: three tiers, gold only
| Token | Value | For |
|---|---|---|
| `--dim` | rgba(201,168,76,.12) | faint: resting hairlines, most borders |
| `--border` | rgba(201,168,76,.22) | normal: card edge, dividers, rails |
| `--border-strong` | rgba(201,168,76,.38) | active/emphasis borders, hover |

One line colour, three volumes. Back/menu frames rest at rgba(201,168,76,.2) and turn gold with
their symbol on hover, press and keyboard focus.

### Text
| Token | Value | For |
|---|---|---|
| `--muted` | #7a6e60 | quiet warm-brown label, disabled state; "Selected deck · tap to change" |
| `--muted-l` | #9c8f7e | a lighter tone of its own (not a duplicate of `--muted`) |
| `--text-helper` | #8c8071 | helper lines that explain a control or section: `.cat-line`. 5.1:1 on the dark ground (`--muted` 3.9:1, `--muted-l` 6.2:1) |
| `--btn-quiet` | #b3a590 | resting tone of every plain text-button (no border; `--gold` on hover/active/focus): Spotlight, Save and Menu, After Dark, All/None, Explore categories, Categories, ⓘ info, the pick-toggle, limit buttons |
| `--quiet-text` | #ab9e8a | quiet words a step lighter: the tagline, chapter descriptions, chapter counts (`.subtitle`, `.chapter .ch-desc`, `.ch-ct`) |
| `--quiet-label` | #b5a892 | the start screen's small labels (`.tok-lbl`) |

Small words are Jost 500, never heavier (the exceptions are the category name on the card and in Spotlight, and the few labels declared at 600, which the font link serves as a real 600): the preset's
name, Next card, Spotlight and Menu, the picked option in The Deck, chapter names, the menu's labels,
The Deck's name. Letter spacing stays as it was; The Deck's name takes the card name's `.26em`.
The count under the card is 17px in `--gold-l`, its two rules 50% gold. "Start from", "Chapters",
"Tonight" and "Yours" are `--gold-l`.

Do not fold the cream-alpha text values (help body copy, sheet heading, section labels, chapter
names off-state) into shared steps, and do not merge `--muted-l` into `--muted`: both read darker
and lower in contrast on a real device than the numbers suggest. They stay per-element literals;
check the rendered result on a real screen before touching this family.

### Frame colours
| Token | Value | For |
|---|---|---|
| `--copper` | #C67B28 | the logo's centre diamond only |
| `--celadon` | #A9C7B6 | everything tappable besides Draw and the quiet words: Change / Save, Close in Spotlight, Twist's line; the chosen option in a choice row (Shuffle, Cards) |
| `--celadon-soft` | `color-mix(in srgb,var(--celadon) 74%,var(--bg))` = rgb(129,150,137) | celadon at the luminance of `--muted-l` (0.284 vs 0.282): small accent bars (Twist divider) |
| `--celadon-hint` | #5b6b63 | sub-lines in the main menu (labels celadon, icons gold) |
| `--celadon-bright` | #eef7f1 | flash in `twistLit` / `spotBright`, settling to `--celadon` |
| `--row-hint` | #6f8579 | `.row-hint` lines under Spotlight / Change / Save; lighter than `--celadon-hint` (3.5:1 to 4.9:1) to read on a phone; .95rem, max-width 112px (fits at 360px). PC hover hints use `--celadon` |
| `--preset` | `renderShell`; falls back to `--gold` | which edition: logo line pairs, preset name. Strangers #8fd14f, Family #ee7a35 (`--mc`) |
| `--preset-a` / `--preset-b` | `renderShell`, Custom with 2+ categories | first and second picked category colour (logo pairs split left/right, gradient `#trP`) |
| `--preset-deep` | `renderShell` | preset a shade deeper (lightness -7 points, floor 45%, darker colours unchanged) for filled areas (start-card diamond and rule) |

One job each: gold is "draw" and the borders; copper is only the logo's centre diamond; the preset
colour says which edition is selected; celadon is tappable chrome (back and menu: celadon at rest,
gold while touched). Custom edition colouring: `design/custom-colours.md`.

### After Dark red
| Token | Value | For |
|---|---|---|
| `--ad-red` | #7a1620 | base: toggle button active state, chapter row |
| `--mark-afterdark` | #c1272d | highlight: card corner marking, category chip/glow |

`categories.js` holds the two After Dark reds pointing at these values.

### Sizes and layout
| Token | Value | For |
|---|---|---|
| `--gold-btn-h` | 34px | the gold button's height (Next card, Draw Cards) |
| `--under-row-h` | 90px | the row under Next card: Spotlight's word and hint, or Change and Save, whichever is taller |
| `--frame-line` | 80% | how much of its colour the card frame's inner line keeps (category, After Dark's mark, Wildcard's gold; the same in Spotlight). At the end of a hand `--frame-rest` takes its share of this, not of the full colour (`card-face.md`) |
| `--dock-w` | `clamp(560px,42vw,640px)` | The Deck docked panel width |
| `--pick-ease` | .2s, .45s while category lines are on | how fast a category's state eases (`deck-category-lines.md`) |
| `--k`, `--pcW` | wide screens | scale and the card's width (`under-card.md`) |
| `--u`, `--bracket-inset`, `--text-gap` | on `.card-area` / `.card` | phone card scaling and the question's side padding (`card-question-width.md`); the card face's frame and name sizes (`card-face.md`) |

### The metal line
| Token | Value | For |
|---|---|---|
| `--metal` | horizontal gold sweep (`#7d6426` / `#c9a84c` / `#f1dc9c` at the middle), fading to transparent at both ends | the top of The Deck and of the phone's menu drawer (3px, with a 1px hairline 3px under it), and the menu's divider (2px) |

The side panels on a computer keep their own edges (The Deck's gilt edge; the menu panel has none).

### Motion curves
`--ease-out: cubic-bezier(.23,1,.32,1)` (things that enter or respond; starts fast, settles soft),
`--ease-sheet: cubic-bezier(.32,.72,0,1)` (drawers and sheets sliding in),
`--ease-move: cubic-bezier(.45,0,.25,1)` (the card's larger moves, e.g. the closing into
Intermezzo). Plain `ease` / `ease-in-out` are not used for entering things.

### Registered properties (`@property`, syntax `<color>`)
`--im-color` (inherits, #c9a84c; pause colour on `<body>`), `--rail-d` / `--rail-m` / `--rail-l`
(inherit, transparent), `--bd-a` #c9a84c / `--bd-b` #a07830 (no inherit), `--nl` #c9a84c (no
inherit; hairlines beside Next card). Also `--p` (`<number>`, 0) and `--a` (`<angle>`, 0deg) for
the card-closing ring and frame.

## Rules that hold everywhere

**Colour changes are eased.** Colour and state changes in the chrome ease over about 0.4 to 0.6s
(`ease`), never snap; instant only under `prefers-reduced-motion:reduce`. Gradients and
`color-mix()` cannot transition, so build them from the registered properties above and put the
`transition` on those properties:
- `--im-color`: `body{transition:--im-color .6s ease}`; diamond, rule and Spotlight copies read it.
- `--rail-d/-m/-l` (inheriting, so the swap's `.c-lift` child reads the rail's colour): the three
  stops of a rail's five-stop gilt sweep; `.c-accent`, `.party-c-accent` and the chapter rows
  (`--ch-rail`) draw from them. Set them with `giltRailPaint(el, hex)` in `gilt.js`, never an
  inline `background`.
- `--bd-a` / `--bd-b`: the gold button's gradient; `.btn-draw` transitions them. Hover answers in
  .2s (the `:hover` rule carries its own `transition:all .2s`; only the way in is quick). At the end
  of a hand the stops derive from `--im-target` (set without easing next to `--im-color`), never the
  eased `--im-color`: that would ease the button twice and lag ~.5s behind the diamond.
- One rule at the end of `styles.css` sets `transition:none` on all of these under reduced motion.

**Corners.** Buttons and the question card are square (the card is a physical playing card with
a drawn double frame and stepped corner squares). Containers that hold content (drawers, category sheet, picker) share one
soft radius.

**The gold button** is one spec: `.btn-draw` (Next Card) and `.cat-go-btn` (Draw Cards). Font-size
.8rem (12.8px; `.btn-draw` steps up with the screen in `styles.css`), letter-spacing .14em, height
`var(--gold-btn-h)` (34px), padding 0 sideways, square corners; hover
`linear-gradient(135deg,#ddb85c,#b08840)` (the gradient lightens, never `filter:brightness()`);
press: `.btn-draw` scales to .97, `.cat-go-btn` to .98. Slim on purpose: under the card the
question must be the brightest thing. Width differs: Next card `14.5em` (`design/under-card.md`),
Draw Cards fills the sheet.

**Motion rules.** Buttons never use `transition: all`: name the properties. Every `:hover` rule sits in
`@media (hover:hover) and (pointer:fine)` so nothing stays lit after a phone tap; keyboard
`:focus-visible` styles are separate. Draw and the square buttons press with
`:active{transform:scale(.97)}`, 160ms `--ease-out`. Question text balances its lines
(`text-wrap:balance`) on the card and in Spotlight; Three uses `pretty`; the font size is never
changed by wrapping; the hand list wraps normally. Per-screen timings: `design/motion-details.md`.

**Readability.** Text a player has to read is never set as quiet, muted small print. Size it
against the nearest comparable text on the card and check at real phone size (390x844). A layout
never shrinks such text to fit; it changes the arrangement (wrap, stack, scroll).

**Fixed file-wide:** the line tokens, the quiet-button tone, the gold button, the corner rule, the
After Dark red mapping, and three labels that rendered in Arial instead of Jost (`.ch-desc`,
`.cbk-chev`, `#dLangIcon`: `<span>`s inside a `<button>` do not inherit the page font).
**Scoped, not swept:** font sizes and letter-spacing (next section).

## The font-size scale
Font sizes and letter-spacing are scoped to what was reviewed, not swept file-wide. The audit
sampled 11 sans sizes, 9 serif sizes and 10 letter-spacing amounts from phone screens; the real
file has more (including the dormant "end-of-set" screen). Only these approved examples are tidied:
- the "EN" language icon: 11px (`#dLangIcon`, inline)
- the fullscreen party-level label: 17px phone / 16px PC, tracking `.16em` phone / `.2em` PC
  (see `design/spotlight.md`)
- the card's name on phone: 18px (a number of `--u`; `card-face.md` for the other sizes)
- the `I / V` progress counter: 14px

Extending the scale needs its own pass: a full value inventory shown to the owner before it is
applied, never a blind `sed` across the file.

## Index of `design/` (open one only when working on that screen)
- `under-card.md`: bottom of the main screen, phone and wide: Next card, hairlines, Spotlight /
  Menu / Ways to play / Save words, Menu panel.
- `three-twist.md`: where Three and Twist live.
- `end-of-hand.md`: end message, Intermezzo back, the flip, Hold/Tap button, hand list.
- `card-closes.md`: message-to-Intermezzo closing animation.
- `spotlight.md`: fullscreen Spotlight, its twin rules with the main screen, Twist divider.
- `deck-chooser.md`: the evening chooser sheet and "the one picked look".
- `deck-docked.md`: The Deck docked on a computer.
- `deck-heading.md`: The Deck sheet heading.
- `deck-category-lines.md`: category lines in The Deck.
- `wide-rails.md`: rails and The Deck on a mouse at 1024px and up.
- `motion-details.md`: first draw, Next/Back swap, drawers, fold-outs, entrance.
- `card-face.md`: the card's frame and its category name, phone, tablet, computer.
- `card-question-width.md`: question side margin and phone card scaling.
- `custom-colours.md`: how the Custom edition is coloured.
