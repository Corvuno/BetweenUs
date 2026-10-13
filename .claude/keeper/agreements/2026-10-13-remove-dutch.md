# Remove Dutch — agreement, 2026-10-13

Owner's words: "Remove Dutch here." Approved after the area split and two questions were
answered: the work version only loses its Dutch, nothing else changes; the Dutch text is
kept in a notes file.

## A) The deck — deck-builder, first
- Every Dutch translation (`nl:` field) is taken out of `questions.js`. Not one English card
  text changes.
- Before removal, all of it is written to a notes file in `questions/` (English next to
  Dutch, grouped by category), so it can come back later. A log line in
  `questions/between-us-deck.md` says it happened and where the notes are.

## C) How the app works — app-builder, second
- The language switch leaves the menu. Every Dutch button/message and the Dutch Twists go;
  the app is English only. Those Dutch strings are added to the same notes file.
- A session saved in Dutch reopens in English, without errors.
- The work version opens in English. Everything else about it stays: no After Dark
  reachable, opens on the Work preset, same link.
- README no longer says the work version is Dutch.

## B) Looks — side effect only
- The menu is one item shorter. Nothing else on screen changes.

## Deliberately not changing
- English card text, the work version's lock and preset, the classic edition (still has its
  own Dutch, kept as-is).

## Done when
- No Dutch reachable anywhere in the main, work or editor version; tests pass; the notes
  file holds every removed Dutch string; menu checked on screen.
