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

## Limits (honest notes)

- "Strict for new code" means *no new findings against the baseline*, not strict typing
  (`strict` is off in the jsconfig files).
- Swap blind spot: fixing one old finding and adding a new one with the identical message in
  the same file keeps the count equal, so it passes.
- `no-unused-vars` only covers local variables and tsc has no `noUnusedLocals`, so a new unused
  top-level function is not reported (functions are shared between files).
- CI runs only `between-us.html`; `between-us-work.html` and `between-us-dev.html` are redirects.
- A broken check run (bad config, crash) fails the script with exit code 2; it never reads as "no findings".
- `ts-api-utils` is in devDependencies because eslint-plugin-sonarjs crashes without it (it does not declare it).
