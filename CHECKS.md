# Automatic checks

`npm run check` (after one `npm install` in the repo root) runs everything:

1. **Browser tests** - `node tests/run.mjs between-us.html` (see `tests/README.md`).
2. **Type check** - TypeScript `checkJs` over the existing `.js` files (`jsconfig.json`; the
   service worker has its own `jsconfig.sw.json`). Nothing is converted and nothing is built;
   the files are read as plain scripts that share top-level names, in the order listed there
   (same as the `<script>` order in `between-us.html`).
3. **Lint** - ESLint (`eslint.config.mjs`) with SonarJS's recommended rules.

`npm run check:static` runs only 2 and 3. GitHub runs all three on every push to main and on
pull requests (`.github/workflows/checks.yml`).

## How strict it is

`checks-baseline.json` lists the findings that already existed when the checks were added.
Only findings **beyond** that list fail (compared by file, rule and message, not line number,
so editing a file does not make old findings look new). New and changed code must be clean.

When old findings are cleaned up, `npm run check:baseline` rewrites the list smaller; the check
prints a hint when it notices fixed ones. Never run it to hide a new finding.

Known false positive in the baseline: names a file publishes with `window.x = x` inside a
wrapper (e.g. `giltRail`) show up as "Cannot find name" in the files that use them.
