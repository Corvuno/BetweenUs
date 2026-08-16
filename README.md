# Between Us

A deck-of-questions card game, played in the browser. No build step — the source is a
handful of plain HTML/CSS/JS files, opened directly.

## Play online

| Play | File | Build profile | Purpose |
|---|---|---|---|
| [▶ Play](https://corvuno.github.io/BetweenUs/between-us.html) | `between-us.html` | `public` | **Main version.** What you hand someone by default. |
| [▶ Play](https://corvuno.github.io/BetweenUs/between-us-work.html) | `between-us-work.html` | `work` | Workplace-safe version — Dutch, no adult content reachable. |
| [▶ Play](https://corvuno.github.io/BetweenUs/between-us-dev.html) | `between-us-dev.html` | `editor` | Development build — everything on by default. dev conveniences on. |

The **Play** links open the live game on GitHub Pages. (Clicking a filename on GitHub shows
the source instead — that's why plain filename links don't launch it.)

[**▶ Open Between Us**](https://corvuno.github.io/BetweenUs/) — the site root redirects to the main version.

Hand out whichever URL you want — each shell's version is baked in, so (for example) the
work URL always opens the work version. Nobody has to pick anything.

## File layout

```
between-us.html          ─┐
between-us-work.html      ├─ thin shells — head/body markup + one line choosing the profile
between-us-dev.html      ─┘
styles.css                  all CSS, shared by every shell
questions.js                 the question deck (content only, no app logic)
app.js                        state, deck engine, and UI — shared by every shell
```

`styles.css`, `questions.js` and `app.js` are each a single real file — there is no
generated copy to keep in sync. Edit any of them once and all three shells pick it up
immediately, since they all load the same files.

Each shell's *only* difference from the other two is one line near the top of `<head>`:

```html
<script>window.BUILD_PROFILE = "public";   // "public" · "work" · "editor"</script>
```

`app.js` reads `window.BUILD_PROFILE` and applies the matching block from the `PROFILES`
object defined at the top of `app.js` (language, shuffle, adult-content locking, spice,
backup category, etc.), which is itself defined once — not duplicated per shell. To
fine-tune a version, edit its block in `PROFILES`; to change what all three versions share,
edit anything else in `app.js`.

Note: because the app is now split across files, `between-us.html` is no longer a single
file you can hand someone to double-click and play offline — you'd need the whole folder,
or the hosted GitHub Pages link. The **Play** links above are unaffected.

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

App and settings changes go in `app.js` once — all three shells pick them up automatically,
since they load the same file. The only thing that should ever differ between
`between-us.html`, `between-us-work.html` and `between-us-dev.html` is their one
`BUILD_PROFILE` line.
