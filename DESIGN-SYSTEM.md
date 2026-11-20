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
Every piece of text in the app uses one of these names for its size, its letter-spacing and its colour; a
new piece of text picks from the list and never writes a value of its own. Excepted, because they are
content or set by the card: the question (Bodoni, in every place it shows), the category name on the card
and in Spotlight (`--name-size`), the title's size, the counts (`.prog-count-num`, `.party-count`),
INTERMEZZO and the end message, the Wildcard mark, and every category, chapter and deck colour.

**Sizes** (rem, 16px = 1rem). Each text takes the nearest step, never a forced step up.
| Token | Value | For |
|---|---|---|
| `--fs-1` | .75rem (12px) | the small capitals: tagline, menu and Deck labels, the words under the card, Spotlight's controls, the counts and notes in Help |
| `--fs-2` | .8rem (12.8px) | buttons and lines in The Deck, the menu and Played; chapter names and descriptions; the gold button; the picked-look words; Help's small headings |
| `--fs-3` | .9rem (14.4px) | "Selected deck · tap to change" and the picked deck's name base; The Deck's heading name; the hint under an opened chapter; Twist's line on a short card; the gold button from 1024px |
| `--fs-4` | .95rem (15.2px) | a sheet's heading and lead in The Deck, the hints under the words and the menu hint, Help's tile text, Twist's line |
| `--fs-5` | 1.0125rem (16.2px) | Help's body text, the picked deck's name on the phone, a card in Played, "Played" empty line |
| `--fs-6` | 1.15rem (18.4px) | the menu's headings and values, a saved hand's name, Help's body text from 1024px, the picked deck's name on a computer |
| `--fs-7` | 1.3rem (20.8px) | Help's lead line; the picked deck's name on a computer from 1600x900 |
Where a size follows the window (the words round the card on a computer, the picked deck's name), the
rule sets one step for the window and one step up from 1600x900 (`--chrome-fs`, `--wide-hint-fs`,
`--deck-fs`). On a computer the hints, and the "Selected deck · click to change" line they share a size
with, are `--wide-hint-fs`: the hint step (`--fs-4`), and `--fs-5` from 1600x900. The picked deck's name (`.tok-val`) sits one step above its neighbours.

**Spacing**
| Token | Value | For |
|---|---|---|
| `--track-1` | .09em | capitals that name or label: chapter and category names, the picked-look words, menu labels, small headings |
| `--track-2` | .16em | capitals that announce: the gold button, the tagline, a drawer title, the picked deck's name |
| `--track-3` | .24em | wide capitals: the words under and round the card, Spotlight's controls, The Deck's heading name |
| `--track-text` | .03em | every small word that is not in capitals (Jost and Federo). Cormorant (italic lines) takes 0. Bodoni, Poiret One and the card's name keep their own |

**Creams and browns.** Text takes the step equal to or lighter than it was, never darker.
| Token | Value | For |
|---|---|---|
| `--cream` | #f0e8d8 | primary text: the question, full-strength labels, the open and hovered label |
| `--sand` | #d2c9b8 | reading text: Help's body, a category's line once picked, a sheet's heading, "Selected deck" on a computer |
| `--stone` | #b5a892 | the resting tone of every plain text-button and quiet label: Spotlight, Menu, After Dark, All/None, the tagline, a chapter's name, description and count, "Selected deck" |
| `--muted-l` | #9c8f7e | quiet lines that still read: INTERMEZZO and the end message, the saved hand's details, Help's notes, the close cross |
| `--text-helper` | #8c8071 | the lowest step for words: helper lines, a category's line, "· tap to change", disabled-looking labels (5.1:1 on the dark ground) |
| `--muted` | #7a6e60 | the empty star and the disabled state only. Never for words |

**Golds and greens**
| Token | Value | For |
|---|---|---|
| `--gold-l` | #e8c97a | light gold: lead lines, "Start from", "Chapters", count numbers, a filled star on the hand list |
| `--gold` | #c9a84c | the title, draw, borders, hover, drawer titles; the darker gold |
| `--celadon` | #a9c7b6 | everything tappable besides Draw and the quiet words: Change / Save, Close in Spotlight, Twist's line, the chosen option in a choice row |
| `--celadon-dim` | #819689 | the dim line under a tappable row: the menu's hints and action words, the hints under the words on the start screen, a saved hand's actions, the Twist divider |
| `--celadon-bright` | #eef7f1 | the flash in `twistLit` / `spotBright`, settling to `--celadon` |

**Faces.** Federo names and announces (the gold button, "Selected deck · tap to change", the headings and lead in The Deck, INTERMEZZO, the end message, the Wildcards name); Jost and Cormorant are read and scanned. Federo has one weight, 400. A `<span>` inside a `<button>` does not inherit the page font: name Jost on it.

Small words are Jost 500, never heavier (the exceptions are the category name on the card and in Spotlight, and the few labels declared at 600, which the font link serves as a real 600): the preset's
name, Next card, Spotlight and Menu, the picked option in The Deck, chapter names, the menu's labels,
The Deck's name. The count under the card is 17px in `--gold-l`, its two rules 50% gold. "Start from", "Chapters",
"Tonight" and "Yours" are `--gold-l`.

### Frame colours
| Token | Value | For |
|---|---|---|
| `--copper` | #C67B28 | the logo's centre diamond only |
| `--petrol` | #2a7a78 | colour in the start card's backs (`backs.js`); stones on the Intermezzo's Eye |
| `--amethyst` | #7a4a9e | the Intermezzo back: its circles' shading; stones on the start card's back |
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
| `--title-stroke` | .017em | the title's stroke in its own colour (`.title`): Poiret One has one cut, so the stroke firms it; in em, so it scales with the title on every screen |
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

**The gold button** is one spec: `.btn-draw` (Next Card) and `.cat-go-btn` (Draw Cards). Federo 400,
`--fs-2` (`.btn-draw` steps up to `--fs-3` from 1024px), `--track-2`, height
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

**Fixed file-wide:** the line tokens, the text set (sizes, spacing, tones, golds, greens, the Federo
rule: "Text" above), the gold button, the corner rule and the After Dark red mapping.

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
