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
