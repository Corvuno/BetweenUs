# Between Us

A deck-of-questions card game, played in the browser. No build step — the source is a
handful of plain HTML/CSS/JS files, opened directly.

## Play online

| Play | File | Build profile | Purpose |
|---|---|---|---|
| [▶ Play](https://corvuno.github.io/BetweenUs/between-us.html) | `between-us.html` | `public` | **Main version.** What you hand someone by default. |
| [▶ Play](https://corvuno.github.io/BetweenUs/between-us.html?profile=work) | `between-us-work.html` | `work` | Workplace-safe version — Dutch, no adult content reachable. Redirects to `between-us.html?profile=work`. |
| [▶ Play](https://corvuno.github.io/BetweenUs/between-us.html?profile=editor) | `between-us-dev.html` | `editor` | Development build — everything on by default, dev conveniences on. Redirects to `between-us.html?profile=editor`. |

The **Play** links open the live game on GitHub Pages. (Clicking a filename on GitHub shows
the source instead — that's why plain filename links don't launch it.)

[**▶ Open Between Us**](https://corvuno.github.io/BetweenUs/) — the site root redirects to the main version.

Hand out whichever URL you want — each one still always opens the same version, nobody has
to pick anything. `between-us-work.html`/`between-us-dev.html` are only kept around as
one-line redirects, for anyone with the old link bookmarked.

**A note on the work profile's safety lock:** it's a courtesy default, not a security
boundary. Since the profile now comes from `?profile=` in the URL, anyone who edits the
address bar can switch away from the workplace-safe version themselves. If that matters for
where you're handing this out, say so — this can be revisited.

## File layout

```
between-us.html    the one real shell — head/body markup, picks its profile from ?profile=
between-us-work.html   1-line redirect to between-us.html?profile=work, for old links
between-us-dev.html     1-line redirect to between-us.html?profile=editor, for old links
styles.css          all CSS
questions.js          the question deck (content only, no app logic)
config.js             build profile + static lookup tables (colors, depth, labels, presets)
state.js               the app's mutable, cross-cutting state
deck.js                 filtering, shuffling, building and advancing through the deck
card.js                 the card in front of you: language, face render, Twist, star, picker
library.js              favourites and custom cards — load/persist/render their drawers
session.js              the session log and save/restore
selection.js            category/preset selection
presentation.js         mood engine, progress, shell chrome, party display, summaries
ui.js                   DOM event wiring and app bootstrap — loads last
```

`between-us.html` and `styles.css` are each a single real file — there is no generated copy
to keep in sync, and no body markup duplicated between profiles. `questions.js` and the 9
`*.js` app modules load as separate `<script>` tags, in the dependency order listed above
(each one relies on globals the ones before it declare); edit any of them once and every
profile picks it up immediately.

`config.js` reads the profile from the URL (`new URLSearchParams(location.search).get('profile')`,
falling back to `"public"`) and applies the matching block from the `PROFILES` object defined
at its top (language, shuffle, adult-content locking, spice, backup category, etc.). To
fine-tune a version, edit its block in `PROFILES`; to change what every version shares, edit
whichever of the 9 modules owns that behavior.

Note: because the app is split across files, `between-us.html` is no longer a single file
you can hand someone to double-click and play offline — you'd need the whole folder, or the
hosted GitHub Pages link. The **Play** links above are unaffected — see below for producing
an offline single file when you need one.

### Building a single-file copy

When you do want one file to hand someone directly:

```
node scripts/build-single-file.mjs public   # -> dist/between-us.html
node scripts/build-single-file.mjs work      # -> dist/between-us-work.html
node scripts/build-single-file.mjs dev        # -> dist/between-us-dev.html
node scripts/build-single-file.mjs all         # all three
```

It inlines `styles.css`, `questions.js`, and the 9 app modules into `between-us.html`, baking
in the chosen profile as a script tag (there's no URL to read `?profile=` from once it's a
local file). `dist/` is untracked (see `.gitignore`) — the build is disposable, rebuilt on
demand, never a copy you keep in sync by hand.

Or build it on GitHub without a local checkout: **Actions → "Build single-file version" →
Run workflow**, pick a profile, then download the `between-us-single-file` artifact from
the finished run.

## Questions

The question deck is developed separately from the app, in [`questions/`](questions/), to
make editing and translating the card text easier without touching app code. See
[`questions/between-us-deck.md`](questions/between-us-deck.md).

### What makes a card a Between Us card

Plenty of decks ask about sex, family and regret — the subject matter isn't what makes one
recognisable. What this deck does, at its best, is **reveal a pattern or expose a
contradiction**: the gap between who someone thinks they are and what they actually do.
*"You tell yourself you have a type. Who do you actually keep ending up with?"* is the
house voice. You answer it and find something out about yourself on the way.

The rules that follow from that:

- **Story cards anchor on the pivot, not the topic** — name the moment something turned,
  and you get the anecdote *and* the reason it stuck.
- **One question per card.** A second question doesn't deepen the first, it replaces it.
- **A second clause earns its place only if it changes the answer.**
- **Don't hand the player the category** — listing the kind of answer you expect narrows
  the answer to that list.
- **Every card is answerable by someone who has no story to tell.**
- **Twelve cards per category, always** — 34 categories, 408 cards. Nothing is ever added,
  only swapped, and what comes out goes to the bench rather than the bin.

The full version, with the lens list used to audit a category, is in
[`questions/between-us-deck.md`](questions/between-us-deck.md#house-style--how-a-card-is-built).

## Updating

App and settings changes go in the 9 `*.js` app modules, `styles.css`, or `questions.js`
once — every profile picks them up automatically, since there's only one shell and one copy
of each file.
`between-us-work.html` and `between-us-dev.html` should never need touching; they're
redirects, not copies.
