# Between Us

A deck-of-questions card game, played as a single self-contained HTML file.

## Play online

| Play | File | Build profile | Purpose |
|---|---|---|---|
| [▶ Play](https://corvuno.github.io/BetweenUs/between-us.html) | `between-us.html` | `public` | **Main version.** What you hand someone by default. |
| [▶ Play](https://corvuno.github.io/BetweenUs/between-us-work.html) | `between-us-work.html` | `work` | Workplace-safe version — Dutch, no adult content reachable. |
| [▶ Play](https://corvuno.github.io/BetweenUs/between-us-dev.html) | `between-us-dev.html` | `editor` | Development build — everything on by default. dev conveniences on. |

The **Play** links open the live game on GitHub Pages. (Clicking the filename on GitHub shows the source instead — that's why plain filename links don't launch it.)

[**▶ Open Between Us**](https://corvuno.github.io/BetweenUs/) — the site root redirects to the main version.

Hand out whichever URL you want — each file's version is baked in, so (for example) the
work URL always opens the work version. Nobody has to pick anything.

## Build profiles

Each file is fully self-contained (HTML/CSS/JS, no build step). Which version a file *is*
comes from a single line at the very top of the `<head>` script:

```js
const BUILD_PROFILE = "public";   // "public" · "work" · "editor"
```

Change that one line and the file becomes that version. All three profiles — and every
setting they control (language, shuffle, adult-content locking, spice, backup category,
etc.) — are defined once, in the `PROFILES` object right below that line, and are identical
across all three files. To fine-tune a version, edit its block in `PROFILES`.

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

### Twist — a modifier layered on the card, not written into it

Some of the deck's best cards are modifiers in disguise — *"How would you have answered
this five years ago?"* turns an ordinary answer into a comparison with an earlier self.
Rather than writing more cards like that one by one, that mechanism is a feature of the
app: a small `+ Twist` control sits under whichever question is showing. Tap it and the
card itself doesn't change — a generic modifier (an earlier-self comparison, the strongest
argument against your own answer, what someone close to you would guess) lands on top of
it instead. Tap again to reroll. It never survives the next draw, and it's never attached
to a card by default — the player decides, per card, whether it would actually make that
question better. The template set lives in `MODIFIERS` in the app's script, not in
`questions/`, because it's a layer any card can wear rather than more editorial content to
maintain per category.

## Updating

All three HTML files are kept in sync with each app update. They now differ by exactly one
line — the `BUILD_PROFILE` selector — so any app or settings change should be applied
identically to all three, and the `PROFILES` block must stay identical between them.
