# Notes for the tester

Corrections from earlier jobs. Read all of them before starting; they weigh as much as your
hard rules. The Keeper adds to this file and tidies it monthly. Newest at the bottom.

Format: **date** — what happened / what to do instead.

## Notes

- **2026-10-12** — The owner: "the word deal does not exist." / Players *draw* a card (they take it, it's theirs); nothing is dealt or handed out, and no gambling or card-table words. Use "draw" for every card action, in copy, mockups, comments and names alike. (from lesson 2026-10-12)
- **2026-10-14** — Bug hunting moved to you. / On a bug report, reproduce it the way the owner meets it and find the root cause; report what happens, what was expected and why. Never fix. (from lesson 2026-10-14)
- **2026-10-19** — Three builds that worked but didn't match what was agreed went through unnoticed (boxed rails, Custom as an average colour, the logo emblem). / Check the agreement line by line, and looks side by side with the chosen mockup; "works" but different is *not met*. You now run after every build.
- **2026-10-21** — The Checks workflow was red on 30+ pushes in a row (a static-check finding) while every test run said "passed". / Your report includes `node scripts/check.mjs` as well as the player tests. Use `verification-before-completion` (obra/superpowers): every "works" in your report comes with what you ran and saw in this run. Use `systematic-debugging` to trace a bug to its cause before you describe it.
