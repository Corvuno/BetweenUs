# Between Us

A deck-of-questions card game.

**Architecture note:** each build is currently one self-contained HTML file
(HTML/CSS/JS inline, no build step) — see "Build profiles" below for how that
works. That's how the app runs today, not a stopgap. On top of it, a further
split is planned: a JS file for the app's systems (deck logic, state, draw
mechanics) and a CSS file for the look (colours, type, layout), with the HTML
files becoming thin shells that reference them — kept separate specifically
so styling and behaviour can be worked on without wading through one 5,000-line
file each time. No file split has been done as of this note — don't assume it
exists, and don't treat "single file" as something to work around in the
meantime; it's simply how the project is structured until that split happens.

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

For now, each file is fully self-contained (HTML/CSS/JS, no build step) — see the
architecture note above for why that's not meant to stay true indefinitely. Which version
a file *is* comes from a single line at the very top of the `<head>` script:

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

### Twist — a lens on the card, not written into it

Some of the deck's best cards are modifiers in disguise — *"How would you have answered
this five years ago?"* turns an ordinary answer into a comparison with an earlier self.
Rather than writing more cards like that one by one, that mechanism is a feature of the
app: a `Twist` control sits in the row under Draw Card, next to Full Screen. Tap it and
the card itself doesn't change — the count already printed on the card ("1 / 5") swaps to
one of four lenses instead: an earlier-self comparison, a future-self comparison, what
someone close to you would notice first, or what you'd say if it cost nothing. Tap again
to reroll, draw the next card and it's gone.

Each lens has to work the instant the card is opened, before anyone has said a word — never
a request to critique or reverse an answer that doesn't exist yet, and never an abstract
argument-for/against move, because these are stories about a life, not positions to defend.
That bar cut the original draft from ten modifiers to four; a "blurted, unfiltered" lens
and a "the scene, not the summary" lens were both drafted and both cut — the first because
this deck asks for considered answers, not reflexes, the second because a well-written card
already does that on its own.

The template set lives in `MODIFIERS` in the app's script, not in `questions/`, because it's
a lens any card can wear rather than more editorial content to maintain per category. It
carries the app's default palette only — Twist has nothing to do with which category is
showing, so it never borrows a category's accent colour.

## Updating

All three HTML files are kept in sync with each app update. They now differ by exactly one
line — the `BUILD_PROFILE` selector — so any app or settings change should be applied
identically to all three, and the `PROFILES` block must stay identical between them.

Once the JS/CSS split above happens, this sync discipline moves with it: the three HTML
shells would still only differ by `BUILD_PROFILE`, but the shared logic and style would
each live in one file referenced by all three, rather than being copy-pasted three times.
Don't assume that split exists until it's actually been done — check for separate `.js`/
`.css` files in the repo root before editing as if it has.
