# Between Us

A deck-of-questions card game, played as a single self-contained HTML file.

## Play online

| File | Purpose |
|---|---|
| [`between-us.html`](between-us.html) | **Main version.** What you hand someone by default. |
| [`between-us-work.html`](between-us-work.html) | Workplace-safe version — Dutch, no adult content reachable. |
| [`between-us-Dev.html`](between-us-Dev.html) | Development build — spice pre-activated, dev conveniences on. |

`index.html` redirects to `between-us.html`, so the root of the site opens the main version.

Each file is fully self-contained (HTML/CSS/JS, no build step). They differ only in the
`SETTINGS` block at the top of the `<script>` tag in `<head>` — see that block in each file
for what each flag does.

## Questions

The question deck is developed separately from the app, in [`questions/`](questions/), to
make editing and translating the card text easier without touching app code. See
[`questions/between-us-deck.md`](questions/between-us-deck.md).

## Updating

All three HTML versions should be kept in sync with each app update — only the settings
block (and, for `between-us-work.html`, the Dutch default) differs between them.
