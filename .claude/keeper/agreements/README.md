# Agreements

One file per wish the owner approved, named `YYYY-MM-DD-short-name.md`, written by the
Keeper. Each holds the agreement per area: what changes, what deliberately doesn't, how the
areas affect each other, and how we'll know it's done. Builders and the tester work from
these; later sessions can check what was actually agreed.

## Where the pictures went

Mockup pages, pictures, print files and their build scripts of finished rounds are on the branch
`archive/keeper-mockups`, complete, at the same paths. The written agreements and each topic's
`decided.md` stay here. The folder `2026-10-31-category-lines-r1/` stays in full because a parked
backlog item builds from it.

To bring a round back: `git fetch origin archive/keeper-mockups` and then
`git checkout origin/archive/keeper-mockups -- .claude/keeper/agreements/<folder>`.
The links the owner was sent are published pages and do not depend on these files.
