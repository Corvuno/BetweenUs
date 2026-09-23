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
hover: linear-gradient(135deg,#ddb85c,#b08840)   active: scale(.98)
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
- the fullscreen party-level label (was `10px`/`.3em` tracking, now `11px`/`.16em`)
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
