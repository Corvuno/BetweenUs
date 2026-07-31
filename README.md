# Between Us

A deck-of-questions card game, played as a single self-contained HTML file.

## Play online

| File | Build profile | Purpose |
|---|---|---|
| [`between-us.html`](between-us.html) | `public` | **Main version.** What you hand someone by default. |
| [`between-us-work.html`](between-us-work.html) | `work` | Workplace-safe version — Dutch, no adult content reachable. |
| [`between-us-Dev.html`](between-us-Dev.html) | `editor` | Development build — everything on by default. dev conveniences on. |

`index.html` redirects to `between-us.html`, so the root of the site opens the main version.

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

## Updating

All three HTML files are kept in sync with each app update. They now differ by exactly one
line — the `BUILD_PROFILE` selector — so any app or settings change should be applied
identically to all three, and the `PROFILES` block must stay identical between them.
