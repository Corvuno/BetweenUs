# Categories and chapters in their own file — agreement, 2026-10-30

Owner: "Where do the categories and all their attributes live? Isn't that something that should be
in its own file like the questions?" Keeper's take, agreed ("Execute the move"): yes. Areas: A (where
the deck lives) and C (how the app is built). B doesn't change.

## What changes
- A new file `categories.js` holds the deck's structure: the CATEGORIES table with its header
  comment, the chapter and bucket tables (CHAPTERS_META, BUCKET_META) and the lookups derived
  straight from them (LEVEL_COLORS, LEVEL_LABELS, CATEGORY_DESCRIPTIONS, SPICY_LEVELS, …).
- It loads right after `questions.js`; `config.js` keeps the app's settings: the build profile,
  the presets, helpers.
- Everything that lists the app's files learns the new one: `between-us.html`, the offline cache
  (`sw.js`), the single-file build, the type check's file order.
- `CLAUDE.md`, `.claude/keeper/project.md` and the deck builder's notes say where categories live now.

## What does not change
- Nothing a player sees or does. Not one value in the tables changes; it's a pure move.
- The presets stay in `config.js` (they belong to The Deck screen, not to the deck itself).

## Done when
- Tests and checks pass, the tester sees the app exactly as before (The Deck, colours, chapters,
  After Dark gate, work profile), and the offline download still works.
