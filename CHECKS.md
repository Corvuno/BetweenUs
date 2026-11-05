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

## Which checks a build runs

Owner, 2026-11-04: "If git runs it, leave it out for everything. Then its only waste.. do the 7
checks and run the check on the new addition let git do the rest." (Earlier the same evening:
"Don't run full tests every time. Run what's hit and a small smoke test check.")

GitHub runs the full browser suite (about 100 checks, 15 minutes) and the type check + lint on
every push to main. A build never runs those by hand. Locally it runs only:

- **The smoke run:** `node tests/run.mjs --smoke` (7 core checks, about 10 seconds: load, draw,
  advance, menu, Spotlight, end of hand, no page errors).
- **The checks for its own addition:** a new or changed check in `tests/run.mjs` is run with
  `node tests/run.mjs --smoke --only=word` (a word from its name). A new check for a bug fix is
  also run once against the old code, to show it fails there.
- **Looks only** (font, colour, spacing, a line): the smoke run and before/after screenshots.

The push lock below still runs the type check + lint by itself on every push to main (about 10
seconds, nobody has to start it): faults it finds never reach the live site.

**After landing:** `main` is live on the website at once, and GitHub's run takes about 15
minutes. **Small changes don't wait** (owner, 2026-11-05: "Can small changes go around the wait
on GitHub?" / "Sounds good."): a commit labelled `Change: small`, or one with no app change
(docs, notes, tests), lands and reports straight away. **Every session starts with GitHub's last
result on main** (`.claude/hooks/main-checks.sh`, run by the SessionStart hook, prints it):
red is fixed before any other work. Medium and large changes still wait: the build looks once
at GitHub's result for its commit before reporting
(`gh api "repos/Corvuno/BetweenUs/actions/workflows/checks.yml/runs?head_sha=<sha>"`, waited
on with Monitor, not by polling). Red is the build's to fix straight away; it reruns only the
failing check locally (`--only=`).

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
