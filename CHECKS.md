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

## Which browser checks a build runs

Owner, 2026-11-04: "Don't run full tests every time. Run what's hit and a small smoke test check."
The full suite is about 100 checks and 15+ minutes; GitHub already runs it on every push to main.

- **Every build:** `npm run check:static`, plus `node tests/run.mjs --smoke` (7 core checks, about
  10 seconds: load, draw, advance, menu, Spotlight, end of hand, no page errors).
- **What the change hits:** `node tests/run.mjs --smoke --only=word,word` with words from the
  names of the checks that cover the changed part (`grep "await check(" tests/run.mjs` lists
  them). Pick specific words: "spotlight" alone picks about 20 checks.
- **Looks only** (font, colour, spacing, a line): smoke, static, and before/after screenshots.
  No `--only`.
- **The full suite** (`node tests/run.mjs`, no flags) only when the change reaches shared
  foundations (state, deck building, sessions, saving, the service worker) or the GitHub run on
  main failed. Once, never repeated; only a failing check gets rerun.
- After landing, a red GitHub run on main is the build's to fix.

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

## Push lock

`.githooks/pre-push` runs the static check (`node scripts/check.mjs`, about 10 seconds, not the
browser suite) whenever a push includes `main`. Any new finding refuses the push with one line;
fix the finding, never the baseline. Pushes of other branches are not checked. A Claude Code
`SessionStart` hook in `.claude/settings.json` switches it on in every session
(`git config core.hooksPath .githooks`); anywhere else, run that command once. If `node_modules`
is missing the hook installs it first. `--no-verify` is never used to get round it.
