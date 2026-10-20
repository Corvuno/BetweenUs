# Notes for the app builder

Corrections from earlier jobs. Read all of them before starting; they weigh as much as your
hard rules. The Keeper adds to this file and tidies it monthly. Newest at the bottom.

Format: **date** — what happened / what to do instead.

## Notes

- **2026-10-12** — The owner: "the word deal does not exist." / Players *draw* a card (they take it, it's theirs); nothing is dealt or handed out, and no gambling or card-table words. Use "draw" for every card action, in copy, mockups, comments and names alike. (from lesson 2026-10-12)
- **2026-10-13** — A help line talked down to the player ("all the little tips for first-timers"). / Copy in this app never treats the player as a beginner: no "little", no "tips for first-timers". Write as one adult to another — say who it's for or what it does. (from lesson 2026-10-13)
- **2026-10-16** — The end-of-hand message shipped in a small muted style the owner couldn't read. / Any text a player has to read gets a readable size, never the small 'quiet message' style by default. (from lesson 2026-10-16)
- **2026-10-19** — Freshness beats variety, always: when cards are chosen (hands, Three's options), an unseen card outranks any other quality such as category variety; variety only sorts within the same freshness. (from lesson 2026-10-19)
- **2026-10-19** — Reviewer on the Three fix: the rule for when Three/Spotlight are dimmed was written twice (`_nextCardBase` and `updateDrawMore`), and tests passed without truly forcing their case (pick during the first animation, pick of a seen card). / Keep one place per rule; write a test that fails without the fix, not one that passes by luck.
- **2026-10-19** — Category-spread fix took four rounds: first a multi-pass function that missed long hands, then a correct one that was 80× slower on All and used an ES2023 call that breaks older phones. / Before reporting: measure speed on the biggest case (All, CPU ×4) against the old code, use no API newer than ES2021 in app code, and test the extreme sizes (20, All) not only 5 and 10.
- **2026-10-19** — Custom fix, first follow-up: dropping the other-preset match also dropped undo-restores-preset, which the owner had been promised; caught in the Keeper's check of the report. / When a fix removes a case, check that every rule already promised for that behaviour still holds, and say plainly if one breaks.
- **2026-10-19** — Release headlines sent back: the seed for the next release left out the biggest things a player sees (PC and tablet layout, The Deck rework, better-mixed hands) and spent a bullet on Change/Save button detail. Writing player-facing summaries: list every user-facing commit first, rank by what a player would notice, headline the top few, fold the rest into "smaller fixes". (from lesson 2026-10-19)
- **2026-10-19** — library.js clean-up: bumped `?v=` to a value another session had already used on main the same day, so after merging the change would not have reached cached phones. Before committing, fetch `origin/main` and pick a `?v=` value it doesn't already carry.
- **2026-10-20** — Three times in a row a new test was reported without checking it fails on the code before the fix, and once "50/50" was reported from a single run while two checks failed intermittently. / Every new test: run it against the previous code and say it failed there. Every report: run the suite at least three times and give each result; a check that fails sometimes is a finding with a cause, never "probably flaky".
- **2026-10-20** — A fix that brings the first card of a new hand into Three made that moment look like the start of the game (Draw Card, Spotlight's start branch). / When a change lets a screen state occur that couldn't occur before, walk every control on that screen (main button, Back, Spotlight, Twist, Three, counter) in that state.
