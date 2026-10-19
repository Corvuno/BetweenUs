# Old-code clean-up — agreement, 2026-10-19

Follows `2026-10-19-code-checks.md`. Area: C (how the app is built). A and B don't change.

Owner's call: clean up the old code's findings file by file. The findings that touch behaviour
(unused code, swallowed errors, over-complex functions) first; the pure type noise (TypeScript
not knowing which kind of element something is) last, as its own round after all files.
"Do the first one now. See how it goes."

## Per file
- One file per job, smallest first; the first is `library.js`.
- Player behaviour stays the same. A real bug found on the way is fixed only when the fix is
  small and keeps the same intent, with a test that reproduces it; anything that would need a
  new message or choice for the player goes back to the owner as a question.
- The baseline shrinks by exactly the fixed findings; no new findings.
- Checks sized to the change: the tester tries a few sets by hand, the reviewer reads the diff once.

## Done when
- Every file's behaviour findings are gone, then the type noise, and the baseline is empty
  (or holds only findings the owner agreed to keep).
