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

## 2026-10-21 — custom cards removed (owner)
After the library.js round the open question was whether a failed save of a custom card should
tell the player. Owner: remove the custom cards instead — no one uses them, among 400+ cards one
barely shows up, and it's a lot of upkeep for a seldom-used feature. "1 yes."
- Goes: the "Custom card" menu row, its drawer (add, list, remove, export, import), and the code
  behind it in every file. The menu just loses the row; nothing takes its place.
- Stays: favourites exactly as they are. The Classic edition (`between-us-classic.html`) is
  untouched. Saved custom cards in a player's browser are left alone, just no longer read.
- Done when: no trace of custom cards in the main app, tests and checks green, the menu and
  every drawer still open and close.
