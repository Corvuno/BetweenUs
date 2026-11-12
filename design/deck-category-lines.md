# Category lines in The Deck

Every category in an open chapter carries its own line (`.cat-line`, the category's `desc` from
`categories.js`, word for word), under its name. Built from existing tokens, no new colour.
- **Face and tone.** Federo, `.8rem`, `.02em`, the chapter line's (`.ch-desc`) size, in
  `--text-helper`; once the category is picked it takes `rgba(240,232,216,.72)`. Never smaller than
  the chapter line, never muted small print.
- **The name keeps its look.** Dot and name sit on one row (grid, dot in column 1, line in column
  2); the picked underline sits under the name only (`.cat-name::after`), not the whole button.
- **Lines on is one look, phone and computer alike:** a chapter's categories in two equal columns
  (`gap:0 10px`), each name with its line under it, `padding:6px` per category (so eleven categories
  fit one phone screen; a one-line category is 54px, above the 44px minimum). One shared rule on
  `html[data-lines="on"] .chapter-panel[data-chapter]`, not a docked-only one.
- **Computer** (docked panel, `dockedQuery` in `selection.js`, the same switch as "THE DECK,
  DOCKED"): lines always on. No hover `title` on a category.
- **Phone / sheet:** lines off by default; a hold of 550ms (the end-of-hand hold) on any category
  switches them on or off for every chapter at once. The choice is remembered (`bu.catLines`).
  `html[data-lines="on"|"off"]` carries the state; JS sets it (docked = on).
- **The hold.** The held category presses in (`scale(.98)`, 160ms) and dims to `.5` across the hold
  (the way Next Card dims while held at the end of a hand); a hold never picks or opens the browser
  menu. Instant under reduced motion.
- **The hint** (`.cat-hint`, a `HINTS` entry `lines` in `state.js`, so "Show hints again" brings it
  back): "Hold a category to see what it's about", Federo `.9rem` in `--muted-l` (the tone
  `.tok-hint` takes on a phone), under the categories of the first chapter opened, phone only, gone
  for good after the first hold.
- **Motion.** One pace, about `.45s` (`--pick-ease` switches from `.2s` to `.45s` while the lines
  are on or moving): names and dots glide to their new places, the panel resizes, lines fade in
  after `180ms` (out first, `250ms`, on the way off). Instant under `prefers-reduced-motion`.
- **An open chapter is never cut off:** `.chapter-group.open{max-height:none}` (the closed cap of
  30rem stays for the fade-out of a hidden chapter).
