# Automatic code checks — agreement, 2026-10-19

Owner: "introduce some standard tests? TypeScript and SonarQube-like things." Keeper's take,
agreed: no TypeScript conversion and no build step, no SonarQube server; instead three checks
inside the project. Area: C (how the app is built). A and B don't change; the app's files and
behaviour don't change in this job.

## What changes
1. **Type check without converting:** TypeScript checks the existing `.js` files as they are
   (`checkJs`), configured for this app's plain globals loaded in a fixed order.
2. **Linter:** ESLint with SonarJS's rules (dead code, copied code, needless complexity, likely bugs).
3. **Automatic on every push to main:** a GitHub workflow runs the test harness, the type check
   and the linter.
- Old code is **not** fixed in this job. The checks are strict for new and changed code; the
  backlog of findings in the old code is measured and reported (how many, what kind, which
  files), so the owner can decide on a clean-up after seeing its size.

## Done when
- One command runs all checks locally; the workflow runs them on push.
- A plain-words report of the old code's findings by kind and file, with a rough size of a clean-up.
